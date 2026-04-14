import { supabase } from './supabase'

export interface Question {
  id: string
  category: string
  text: string
  type: 'mcq' | 'open'
  options: { text: string; is_correct: boolean }[] | null
  llm_rubric: string | null
  max_score: number
  created_at: string
}

/**
 * Получить все вопросы из Supabase.
 * Использует anon ключ (RLS разрешает read для всех авторизованных).
 */
export const fetchQuestions = async (): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('fetchQuestions error:', error)
    throw new Error(`Failed to fetch questions: ${error.message}`)
  }

  return data || []
}

export interface EvaluationResult {
  score: number
  feedback: string
  category_scores: Record<string, number>
}

/**
 * Отправить ответы на LLM-оценку.
 * Передаёт Bearer-токен сессии для серверной валидации JWT.
 */
export const submitTestResults = async (
  answers: Record<string, { value: unknown; text?: string }>
): Promise<EvaluationResult> => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('No active session. Please log in first.')
  }

  const response = await fetch('/api/ai/evaluate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ answers }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`Evaluation failed: ${response.status} ${error.error || ''}`)
  }

  return response.json()
}
