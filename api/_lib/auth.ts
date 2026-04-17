import { createClient } from '@supabase/supabase-js'

export interface ManagerAuthContext {
  userId: string
  companyId: string
  role: string
}

/**
 * Проверяет, является ли пользователь менеджером или админом, 
 * и возвращает его контекст (userId, companyId, role).
 */
export async function verifyManagerAuth(req: Request): Promise<ManagerAuthContext | null> {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]
  
  // Создаем клиент с токеном пользователя, чтобы проверить его сессию
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('[managerAuth] Auth error:', authError)
    return null
  }

  // Теперь проверяем роль в таблице users (или profiles)
  // В нашем проекте основная таблица пользователей — 'users'
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, company_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('[managerAuth] Profile fetch error:', profileError)
    return null
  }

  if (profile.role !== 'manager' && profile.role !== 'admin') {
    console.warn(`[managerAuth] Access denied for user ${user.id} with role ${profile.role}`)
    return null
  }

  if (!profile.company_id) {
    console.error(`[managerAuth] User ${user.id} has no company_id`)
    return null
  }

  return {
    userId: profile.id,
    companyId: profile.company_id,
    role: profile.role
  }
}
