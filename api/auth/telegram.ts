/**
 * Vercel Serverless Function — Telegram Shadow Auth
 *
 * Паттерн: клиент отправляет initData → сервер проверяет HMAC-SHA-256 →
 * находит/создаёт пользователя в Supabase → возвращает сессию.
 *
 * Env vars: TG_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'crypto'

// ─── HMAC Validation ───────────────────────────────────────────────────────

function hmacSHA256(key: string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest()
}

function validateTelegramInitData(initData: string, botToken: string): boolean {
  const urlParams = new URLSearchParams(initData)
  const hash = urlParams.get('hash')
  if (!hash) return false

  urlParams.delete('hash')

  const params = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = hmacSHA256(botToken, 'WebAppData')
  const dataCheckString = hmacSHA256(secretKey.toString('hex'), params)

  return timingSafeEqual(dataCheckString, Buffer.from(hash, 'hex'))
}

// ─── Deterministic password (same for same user, never changes) ─────────────

function getUserPassword(tgId: number, botToken: string): string {
  return hmacSHA256(botToken, `shadow_pw_${tgId}`).toString('hex')
}

// ─── Handler ───────────────────────────────────────────────────────────────

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const botToken = process.env.TG_BOT_TOKEN
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!botToken || !supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 })
  }

  let body: { initData?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  const { initData } = body
  if (!initData || typeof initData !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing initData' }), { status: 400 })
  }

  // Step 1: Validate HMAC
  if (!validateTelegramInitData(initData, botToken)) {
    return new Response(JSON.stringify({ error: 'Invalid Telegram signature' }), { status: 401 })
  }

  // Step 2: Parse Telegram user
  const urlParams = new URLSearchParams(initData)
  const userStr = urlParams.get('user')
  if (!userStr) {
    return new Response(JSON.stringify({ error: 'No user data in initData' }), { status: 400 })
  }

  let tgUser: { id: number; first_name: string; last_name?: string; username?: string }
  try {
    tgUser = JSON.parse(userStr)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid user JSON' }), { status: 400 })
  }

  const tgId = tgUser.id
  const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ').trim() || `User ${tgId}`
  const username = tgUser.username || `user_${tgId}`
  const email = `tg_${tgId}@atte.local`
  const password = getUserPassword(tgId, botToken)

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // Step 3: Check if profile exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, company_id')
    .eq('telegram_id', tgId)
    .single()

  let companyId: string | null = null

  if (existingUser) {
    companyId = existingUser.company_id
  } else {
    // Step 4: Create default company
    const { data: newCompany } = await supabase
      .from('companies')
      .insert({
        name: `${fullName}'s Workspace`,
        size_category: 'micro',
        pricing_tier: 'pending_micro',
      })
      .select('id')
      .single()

    companyId = newCompany?.id || null

    // Step 5: Create Supabase auth user
    const { data: authData, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        telegram_id: tgId,
        full_name: fullName,
        username,
      },
    })

    if (createErr && createErr.code !== 'user_already_exists') {
      console.error('[auth/telegram] createUser error:', createErr)
      return new Response(JSON.stringify({ error: createErr.message }), { status: 500 })
    }

    const userId = authData?.user?.id

    if (userId) {
      await supabase.from('users').insert({
        id: userId,
        telegram_id: tgId,
        full_name: fullName,
        job_title: 'Not set',
        department: 'Not set',
        grade: 1,
        company_id: companyId,
      })
    }
  }

  // Step 7: Sign in to get session
  const { data: signInResult, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInErr) {
    console.error('[auth/telegram] signIn error:', signInErr)
    return new Response(JSON.stringify({ error: signInErr.message }), { status: 500 })
  }

  return new Response(
    JSON.stringify({
      session: signInResult.session,
      user: { telegram_id: tgId, full_name: fullName, username, company_id: companyId },
      is_new_user: !existingUser,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
