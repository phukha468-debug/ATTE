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

export interface TestResult {
  id: string
  user_id: string
  company_id: string | null
  type?: 'stage1' | 'stage2'
  answers: unknown
  llm_feedback: {
    score: number
    feedback: string
    category_scores?: Record<string, number>
    time_saved_multiplier?: number
  } | null
  score: number | null
  is_completed: boolean
  created_at: string
  users: {
    full_name: string
    role: string
  } | null
}

/**
 * Получить результаты аттестации сотрудников компании.
 * RLS автоматически фильтрует по company_id авторизованного пользователя.
 */
export const fetchCompanyResults = async (): Promise<TestResult[]> => {
  const { data, error } = await supabase
    .from('test_results')
    .select('*, users(full_name, role)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchCompanyResults error:', error)
    throw new Error(`Failed to fetch results: ${error.message}`)
  }

  return data || []
}

/**
 * Получить профиль текущего пользователя.
 */
export const fetchCurrentUserProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('fetchCurrentUserProfile error:', error)
    return null
  }

  return data
}

/**
 * Получить последний завершенный результат текущего пользователя для Этапа 1.
 */
export const fetchLatestUserResult = async (): Promise<TestResult | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_completed', true)
    .or('type.eq.stage1,type.is.null') // Stage 1 results
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('fetchLatestUserResult error:', error)
    return null
  }

  return data
}

/**
 * Получить последний завершенный результат текущего пользователя для Этапа 2 (Симулятор).
 */
export const fetchLatestSimulatorResult = async (): Promise<TestResult | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_completed', true)
    .eq('type', 'stage2')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('fetchLatestSimulatorResult error:', error)
    return null
  }

  return data
}

/**
 * Отправить результаты Этапа 3 (Микро-проект).
 */
export const submitStage3Result = async (data: any): Promise<void> => {
  const profile = await fetchCurrentUserProfile()

  if (!profile) throw new Error('No user profile found')

  const { error } = await supabase.from('test_results').insert({
    user_id: profile.id,
    company_id: profile.company_id,
    type: 'stage3',
    answers: data,
    score: 0, // Score will be determined by manager later
    is_completed: true,
  })

  if (error) {
    console.error('submitStage3Result error:', error)
    throw new Error(`Failed to submit Stage 3 result: ${error.message}`)
  }
}
