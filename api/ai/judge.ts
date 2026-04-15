import OpenAI from 'openai'

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
    const openRouterKey = process.env.OPENROUTER_API_KEY
    if (!openRouterKey) {
      console.error('[judge] Missing OPENROUTER_API_KEY')
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing API Key' }), { status: 500 })
    }

    const body = await req.json()
    const { task, chatHistory } = body

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
      model: 'anthropic/claude-3.5-sonnet',
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

    return new Response(cleanedResult, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    console.error('[judge] Error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500 })
  }
}
