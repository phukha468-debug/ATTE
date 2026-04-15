import OpenAI from 'openai'

export const config = {
  runtime: 'edge',
}

// Initialize OpenAI outside the handler for potential instance reuse in Edge Runtime
const getOpenAIClient = (apiKey: string) => new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: apiKey,
  defaultHeaders: {
    'HTTP-Referer': 'https://atte-66ai.app',
    'X-Title': '66AI Attestation Simulator',
  },
})

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const openRouterKey = process.env.OPENROUTER_API_KEY
    if (!openRouterKey) {
      console.error('[simulate] Missing OPENROUTER_API_KEY in environment')
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing API Key' }), { status: 500 })
    }

    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), { status: 400 })
    }

    const openai = getOpenAIClient(openRouterKey)

    const systemMessage = {
      role: 'system',
      content: 'Ты — полезный ИИ-ассистент корпоративной платформы. Твоя цель — четко и качественно выполнять рабочие поручения пользователя. Отвечай кратко и по делу.',
    }

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    }).catch(e => {
      console.error('[simulate] OpenRouter API Error:', e)
      throw new Error(`OpenRouter error: ${e.message || 'Unknown error'}`)
    })

    const assistantMessage = completion.choices[0]?.message?.content || ''

    return new Response(
      JSON.stringify({ content: assistantMessage }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('[simulate] Unexpected error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500 })
  }
}
