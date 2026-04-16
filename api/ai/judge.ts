import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
}

const getOpenAIClient = (apiKey: string) => new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: apiKey,
  defaultHeaders: {
    'HTTP-Referer': 'https://atte-66ai.app',
    'X-Title': '66AI LLM Judge',
  },
})

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const openRouterKey = process.env.OPENROUTER_API_KEY

    if (!supabaseUrl || !serviceRoleKey || !openRouterKey) {
      console.error('[judge] Missing env vars')
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
      console.error('[judge] Auth error:', authError)
      return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 })
    }

    const userId = user.id

    // ── Step 2: Parse body ──
    const body = await req.json()
    const { task, chatHistory, userId: payloadUserId, companyId: payloadCompanyId } = body

    if (!task || !chatHistory || !Array.isArray(chatHistory)) {
      return new Response(JSON.stringify({ error: 'Missing task or chat history' }), { status: 400 })
    }

    const openai = getOpenAIClient(openRouterKey)

    const systemPrompt = `Ты — строгий HR-эксперт по оценке ИИ-навыков. Проанализируй переписку пользователя с ИИ-ассистентом.
Задача пользователя (Бриф):
Контекст: ${task.context}
Цель: ${task.objective}
Формат: ${task.format}

Оцени навыки промптинга пользователя по критериям:
1. Дал ли он ИИ четкий контекст и роль?
2. Описал ли желаемый формат результата?
3. Давал ли уточняющие инструкции при итерациях?
4. Насколько эффективно он использовал ИИ для ускорения задачи?

Верни СТРОГО валидный JSON (БЕЗ markdown-оберток):
{
  "score": <число 0-100>,
  "feedback": "<краткий разбор ошибок и плюсов на русском, 3-4 предложения>",
  "time_saved_multiplier": <число, во сколько раз ИИ ускорил задачу (например 2.5, 4.0)>
}`

    const chatContent = chatHistory.map(m => `${m.role === 'user' ? 'Пользователь' : 'ИИ'}: ${m.content}`).join('\n\n')

    const completion = await openai.chat.completions.create({
      model: 'anthropic/claude-3.7-sonnet',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `История переписки:\n${chatContent}` }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }).catch(e => {
      console.error('[judge] OpenRouter API Error:', e)
      throw new Error(`OpenRouter error: ${e.message || 'Unknown error'}`)
    })

    const resultRaw = completion.choices[0]?.message?.content || '{}'
    
    // Clean potential markdown fences if model ignored instructions
    const cleanedResult = resultRaw.replace(/```json/g, '').replace(/```/g, '').trim()
    
    let llmJson: any
    try {
      llmJson = JSON.parse(cleanedResult)
    } catch (err) {
      console.error('[judge] JSON Parse error:', cleanedResult)
      return new Response(JSON.stringify({ error: 'Failed to parse AI response' }), { status: 500 })
    }

    // ── Step 3: Determine user and company ──
    const effectiveUserId = payloadUserId || userId
    let effectiveCompanyId = payloadCompanyId

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    if (!effectiveCompanyId) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', effectiveUserId)
        .single()
      effectiveCompanyId = userProfile?.company_id || null
    }

    // ── Step 4: Save to test_results as Stage 2 ──
    try {
      console.log('[judge] Attempting to save result for user:', effectiveUserId)
      const { data: insertData, error: insertError } = await supabase
        .from('test_results')
        .insert({
          user_id: effectiveUserId,
          company_id: effectiveCompanyId,
          type: 'stage2',
          answers: chatHistory,
          llm_feedback: {
            score: llmJson.score,
            feedback: llmJson.feedback,
            time_saved_multiplier: llmJson.time_saved_multiplier
          },
          score: llmJson.score,
          is_completed: true,
        })
        .select()

      if (insertError) {
        console.error('[judge] Supabase Insert Error:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        })
        return new Response(JSON.stringify({ 
          error: 'Failed to save results to database', 
          details: insertError.message,
          code: insertError.code
        }), { status: 500 })
      }
      console.log('[judge] Result saved successfully:', insertData?.[0]?.id)
    } catch (dbErr: any) {
      console.error('[judge] DB operation exception:', dbErr)
      return new Response(JSON.stringify({ 
        error: 'Database operation failed', 
        details: dbErr.message 
      }), { status: 500 })
    }

    return new Response(JSON.stringify(llmJson), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    console.error('[judge] Error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500 })
  }
}
