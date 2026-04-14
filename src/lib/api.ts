import { supabase } from './supabase'

export interface Question {
  id: string
  category: string
  text: string
  type: 'mcq' | 'open'
  options: { text: string; is_correct: boolean }[] | null
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

/**
 * Получить вопросы по категории.
 */
export const fetchQuestionsByCategory = async (category: string): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('fetchQuestionsByCategory error:', error)
    throw new Error(`Failed to fetch questions for category ${category}: ${error.message}`)
  }

  return data || []
}
