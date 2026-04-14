/**
 * Vercel Serverless Function — LLM-Judge Evaluation
 *
 * POST /api/ai/evaluate
 * Body: { answers: Record<question_id, { value, text }> }
 * Auth: Bearer token from Supabase session
 *
 * Flow:
 * 1. Validate JWT via supabase.auth.getUser()
 * 2. Fetch questions from DB (Service Role Key)
 * 3. Build prompt with questions + user answers
 * 4. Call OpenRouter (Claude 3.7 Sonnet)
 * 5. Parse JSON response, save to test_results
 * 6. Return score + feedback to client
 *
 * Env: OPENROUTER_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Strip markdown json fences from Claude's response */
function cleanClaudeJson(raw: string): string {
  return raw
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()
}

// ─── Handler ───────────────────────────────────────────────────────────────

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const openRouterKey = process.env.OPENROUTER_API_KEY

  if (!supabaseUrl || !serviceRoleKey || !openRouterKey) {
    console.error('[evaluate] Missing env vars')
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 })
  }

  // ── Step 1: Auth validation ──
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing auth token' }), { status: 401 })
  }

  const token = authHeader.split(' ')[1]
  const supabaseAuth = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser()

  if (authError || !user) {
    console.error('[evaluate] Auth error:', authError)
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 })
  }

  const userId = user.id

  // ── Step 2: Parse body ──
  let body: { answers?: Record<string, { value: unknown; text?: string }> }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  const { answers } = body
  if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
    return new Response(JSON.stringify({ error: 'No answers provided' }), { status: 400 })
  }

  // ── Step 3: Fetch questions from DB ──
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const questionIds = Object.keys(answers)
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, category, text, type, max_score, llm_rubric')
    .in('id', questionIds)

  if (questionsError || !questions) {
    console.error('[evaluate] Questions fetch error:', questionsError)
    return new Response(JSON.stringify({ error: 'Failed to load questions' }), { status: 500 })
  }

  // ── Step 4: Build evaluation prompt ──
  const questionMap = new Map(questions.map((q) => [q.id, q]))

  let userAnswersBlock = ''
  for (const [qId, answer] of Object.entries(answers)) {
    const q = questionMap.get(qId)
    if (!q) continue

    if (q.type === 'mcq') {
      const selectedText = answer.text || '(no answer)'
      userAnswersBlock += `\n### [${q.category.toUpperCase()}] ${q.text}\n**Ответ сотрудника:** ${selectedText}\n`
    } else {
      const openText = answer.text || '(пусто)'
      userAnswersBlock += `\n### [${q.category.toUpperCase()}] ${q.text}\n**Ответ сотрудника:**\n${openText}\n`
    }
    if (q.llm_rubric) {
      userAnswersBlock += `**Критерии оценки:** ${q.llm_rubric}\n`
    }
  }

  const totalMaxScore = questions.reduce((sum, q) => sum + (q.max_score || 4), 0)

  const systemPrompt = `Ты — строгий HR-эксперт по ИИ-навыкам. Оцени ответы сотрудника по тесту "Карта рутины 66AI".

Правила:
1. Оценивай каждый ответ по критериям, указанным в llm_rubric (если есть) или по общей адекватности.
2. Для MCQ-вопросов: если выбран правильный вариант — полный балл, если нет — 0.
3. Для открытых вопросов: оцени по полноте, конкретности и реалистичности.
4. Итоговый score = (набранные баллы / ${totalMaxScore}) * 100, округлённый до целого.
5. Feedback: 3-5 предложений на русском. Начни с сильных сторон, затем зоны роста, затем конкретная рекомендация.
6. Выдай СТРОГО валидный JSON без Markdown-оборачивания, без приветствий. Формат:
{"score":<0-100>,"feedback":"<текст>","category_scores":{"routine":0,"prompting":0,"limitations":0,"legal":0}}`

  const userPrompt = `Вот ответы сотрудника. Оцени их:${userAnswersBlock}`

  // ── Step 5: Call OpenRouter (Claude 3.7 Sonnet) ──
  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: openRouterKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://atte-66ai.app',
      'X-Title': '66AI Attestation',
    },
  })

  let llmRaw: string
  try {
    const completion = await openai.chat.completions.create({
      model: 'anthropic/claude-3.7-sonnet',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    })

    llmRaw = completion.choices[0]?.message?.content || ''
  } catch (llmErr: any) {
    console.error('[evaluate] OpenRouter error:', llmErr)
    return new Response(JSON.stringify({ error: 'LLM evaluation failed', details: llmErr.message }), { status: 502 })
  }

  if (!llmRaw) {
    return new Response(JSON.stringify({ error: 'Empty LLM response' }), { status: 502 })
  }

  // ── Step 6: Parse JSON ──
  let llmJson: { score: number; feedback: string; category_scores?: Record<string, number> }
  try {
    const cleaned = cleanClaudeJson(llmRaw)
    llmJson = JSON.parse(cleaned)
  } catch {
    console.error('[evaluate] JSON parse error. Raw:', llmRaw)
    return new Response(JSON.stringify({ error: 'Invalid LLM response format' }), { status: 502 })
  }

  if (typeof llmJson.score !== 'number' || typeof llmJson.feedback !== 'string') {
    console.error('[evaluate] Missing score/feedback. Parsed:', llmJson)
    return new Response(JSON.stringify({ error: 'Incomplete LLM response' }), { status: 502 })
  }

  // ── Step 7: Fetch user's company_id ──
  const { data: userProfile } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', userId)
    .single()

  const companyId = userProfile?.company_id || null

  // ── Step 8: Save to test_results ──
  const { error: insertError } = await supabase.from('test_results').insert({
    user_id: userId,
    company_id: companyId,
    answers,
    llm_feedback: {
      score: llmJson.score,
      feedback: llmJson.feedback,
      category_scores: llmJson.category_scores || {},
    },
    score: llmJson.score,
    is_completed: true,
  })

  if (insertError) {
    console.error('[evaluate] DB insert error:', insertError)
    return new Response(JSON.stringify({ error: 'Failed to save results' }), { status: 500 })
  }

  // ── Step 9: Return result ──
  return new Response(
    JSON.stringify({
      score: llmJson.score,
      feedback: llmJson.feedback,
      category_scores: llmJson.category_scores || {},
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
