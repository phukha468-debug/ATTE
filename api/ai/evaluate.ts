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
 * 4. Call OpenRouter (GPT-3.5-Turbo)
 * 5. Parse JSON response, save to test_results
 * 6. Return score + feedback to client
 *
 * Env: OPENROUTER_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

export const config = {
  runtime: 'edge',
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Strip markdown json fences from model response */
function cleanJson(raw: string): string {
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

  try {
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

    console.log('[AI-Eval] Answers received:', answers)

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

      const answerText = answer.text || (q.type === 'mcq' ? '(no answer)' : '(пусто)')
      userAnswersBlock += `\n[${q.category}] ${q.text}\nОтвет: ${answerText}`
      if (q.llm_rubric) {
        userAnswersBlock += `\nРубрика: ${q.llm_rubric}`
      }
      userAnswersBlock += '\n'
    }

    const totalMaxScore = questions.reduce((sum, q) => sum + (q.max_score || 4), 0)

    const systemPrompt = `HR-expert. Grade employee responses. Rules:
1. MCQ: match = full score, mismatch = 0.
2. Open: grade detail and relevance.
3. Final score = round(earned/max*100).
4. Feedback: 3 sentences in Russian (strengths, growth, advice).
Return ONLY compressed JSON:
{"score":0-100,"feedback":"str","category_scores":{"routine":0,"prompting":0,"limitations":0,"legal":0}}`

    const userPrompt = `Ответы сотрудника:${userAnswersBlock}`

    // ── Step 5: Call OpenRouter (GPT-3.5-Turbo) ──
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
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 500,
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
      const cleaned = cleanJson(llmRaw)
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
      .from('profiles')
      .select('company_id')
      .eq('id', userId)
      .single()

    const companyId = userProfile?.company_id || null

    // ── Step 8: Save to stage1_results ──
    const { error: insertError } = await supabase.from('stage1_results').insert({
      user_id: userId,
      company_id: companyId,
      total_score: llmJson.score,
      passed: llmJson.score >= 60,
    })

    if (insertError) {
      console.error('[evaluate] DB insert error:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to save results', _code: insertError.code, _detail: insertError.message }), { status: 500 })
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
  } catch (err: any) {
    console.error('[evaluate] Unexpected error:', err)
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 500 })
  }
}
