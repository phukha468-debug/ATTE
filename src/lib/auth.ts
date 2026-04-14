import { supabase } from './supabase'

export interface AuthUser {
  tg_id: number
  full_name: string
  username: string
  company_id: string | null
}

export interface AuthResult {
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
  }
  user: AuthUser
  is_new_user: boolean
}

/**
 * Отправить initData на сервер для Shadow Auth.
 * Сервер проверит HMAC подпись Telegram и вернёт сессию Supabase.
 */
export async function loginWithTelegram(): Promise<AuthResult> {
  const webapp = (window as any).Telegram?.WebApp
  let initData = webapp?.initData

  // DEV MODE bypass: when running locally without Telegram WebApp
  if (import.meta.env.DEV && !initData) {
    console.warn('[auth] DEV MODE: bypassing Telegram auth for local development')
    initData = 'DEV_MODE'
  }

  if (!initData) {
    throw new Error('Telegram WebApp initData недоступен. Запустите приложение внутри Telegram.')
  }

  const response = await fetch('/api/auth/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))

    // User-friendly messages for common error codes
    if (response.status === 403) {
      throw new Error('Откройте приложение через Telegram, а не через браузер.')
    }
    if (response.status === 401) {
      throw new Error('Ошибка авторизации Telegram. Попробуйте открыть приложение заново.')
    }
    throw new Error(`Auth failed: ${response.status} ${error.error}`)
  }

  const result: AuthResult = await response.json()

  // Установить сессию в Supabase клиент
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: result.session.access_token,
    refresh_token: result.session.refresh_token,
  })

  if (sessionError) {
    throw new Error(`setSession failed: ${sessionError.message}`)
  }

  return result
}

/**
 * Проверить, авторизован ли пользователь в Supabase.
 */
export async function getAuthUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

/**
 * Выйти из аккаунта.
 */
export async function logout() {
  await supabase.auth.signOut()
}
