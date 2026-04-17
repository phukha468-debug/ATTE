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

export const fetchQuestions = async (): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Failed to fetch questions: ${error.message}`)
  return data || []
}

// ─── Stage 1 result ──────────────────────────────────────────────────────────

export interface Stage1Result {
  id: string
  user_id: string
  company_id: string | null
  total_score: number
  passed: boolean
  created_at: string
}

export const fetchLatestUserResult = async (): Promise<Stage1Result | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('stage1_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) { console.error('fetchLatestUserResult error:', error); return null }
  return data
}

// ─── Stage 2 result ──────────────────────────────────────────────────────────

export interface Stage2Result {
  id: string
  user_id: string
  company_id: string | null
  profile_id: string | null
  task_id: string | null
  acceleration_x: number | null
  score_total: number | null
  score_prompting: number | null
  score_iterativeness: number | null
  validated_hours_per_month: number | null
  passed: boolean
  created_at: string
}

export const fetchLatestSimulatorResult = async (): Promise<Stage2Result | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('stage2_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) { console.error('fetchLatestSimulatorResult error:', error); return null }
  return data
}

// ─── Stage 3 result ──────────────────────────────────────────────────────────

export interface Stage3Result {
  id: string
  user_id: string
  company_id: string | null
  project_name: string | null
  linked_routine_task: string | null
  verdict: string | null
  confirmed_hours_per_month: number | null
  created_at: string
}

export const fetchLatestStage3Result = async (): Promise<Stage3Result | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('stage3_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) { console.error('fetchLatestStage3Result error:', error); return null }
  return data
}

// ─── Assessment result (aggregated) ─────────────────────────────────────────

export interface AssessmentResult {
  id?: string
  user_id: string
  company_id: string | null
  stage1_result_id: string | null
  stage2_result_id: string | null
  stage3_result_id: string | null
  final_grade: number | null
  grade_name: string | null
  is_champion: boolean | null
  needs_training: boolean | null
  validated_hours_per_month: number | null
  profiles?: { full_name: string; role: string } | null
}

export const fetchAllCompanyResults = async (): Promise<AssessmentResult[]> => {
  const { data, error } = await supabase
    .from('assessment_results')
    .select('*, profiles(full_name, role)')
    .order('final_grade', { ascending: false })

  if (error) throw new Error(`Failed to fetch results: ${error.message}`)
  return data || []
}

// ─── User profile ─────────────────────────────────────────────────────────────

export const fetchCurrentUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) { console.error('fetchCurrentUserProfile error:', error); return null }
  return data
}

// ─── Submit helpers (kept for compatibility) ─────────────────────────────────

export const submitTestResults = async (
  answers: Record<string, { value: unknown; text?: string }>
): Promise<{ score: number; feedback: string; category_scores: Record<string, number> }> => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('No active session.')

  const response = await fetch('/api/ai/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ answers }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`Evaluation failed: ${response.status} ${error.error || ''}`)
  }
  return response.json()
}

export const submitStage3Result = async (data: any): Promise<void> => {
  const profile = await fetchCurrentUserProfile()
  if (!profile) throw new Error('No user profile found')

  const { error } = await supabase.from('stage3_results').insert({
    user_id: profile.id,
    company_id: profile.company_id,
    project_name: data.taskName,
    linked_routine_task: data.linkedTask,
    verdict: 'pending',
    confirmed_hours_per_month: data.timeSavedPerMonth,
  })

  if (error) throw new Error(`Failed to submit Stage 3 result: ${error.message}`)
}

export const approveStage3Result = async (resultId: string): Promise<void> => {
  const { error } = await supabase
    .from('stage3_results')
    .update({ verdict: 'approved' })
    .eq('id', resultId)

  if (error) throw new Error(`Failed to approve Stage 3 result: ${error.message}`)
}

// ─── Legacy aliases for backward compatibility ────────────────────────────────

export type TestResult = AssessmentResult
export const fetchCompanyResults = fetchAllCompanyResults
