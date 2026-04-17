/**
 * Vercel Serverless Function — Telegram Shadow Auth
 *
 * Паттерн: клиент отправляет initData → сервер проверяет HMAC-SHA-256 →
 * находит/создаёт пользователя в Supabase → возвращает сессию.
 *
 * DEV MODE: initData === "DEV_MODE" пропускает HMAC-валидацию (только local dev).
 *
 * Env vars: TG_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

export const config = { runtime: 'nodejs' }

// ─── DB Schema (Law of Truth — synced with BRIEF.md) ────────────────────────

const DB_SCHEMA = {
  profiles: {
    table: 'profiles',
    tg_id: 'tg_id',
    full_name: 'full_name',
    company_id: 'company_id',
    role: 'role',
  },
  companies: {
    table: 'companies',
    name: 'name',
    size_category: 'size_category',
    pricing_tier: 'pricing_tier',
  },
} as const

// ─── HMAC Validation ───────────────────────────────────────────────────────

function hmacSHA256(key: string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest()
}

function validateTelegramInitData(initData: string, botToken: string): boolean {
  const paramsMap = new Map<string, string>()

  // Manual parsing — no URLSearchParams magic that can distort values
  initData.split('&').forEach(pair => {
    const index = pair.indexOf('=')
    if (index === -1) return
    const key = pair.slice(0, index)
    const val = pair.slice(index + 1)
    paramsMap.set(key, decodeURIComponent(val))
  })

  // Only extract 'hash' — do NOT delete 'signature'.
  // Telegram computes hash over ALL fields except 'hash' itself,
  // so 'signature' (if present) must stay in the data_check_string.
  const hash = paramsMap.get('hash')
  if (!hash) {
    console.warn('[auth] ✗ No hash in initData')
    return false
  }

  paramsMap.delete('hash')

  const keys = Array.from(paramsMap.keys()).sort()
  const dataCheckString = keys.map(key => `${key}=${paramsMap.get(key)}`).join('\n')

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  return calculatedHash === hash
}

// ─── Deterministic password (same for same user, never changes) ─────────────

function getUserPassword(tgId: number, botToken: string): string {
  return hmacSHA256(botToken, `shadow_pw_${tgId}`).toString('hex')
}

// ─── Core logic: create or find user, return session via res ────────────────

async function authUser(
  supabase: any,
  tgId: number,
  fullName: string,
  username: string,
  botToken: string,
  res: VercelResponse,
): Promise<VercelResponse | void> {
  const { profiles, companies } = DB_SCHEMA
  console.log(`[auth] → authUser called: tgId=${tgId}, fullName="${fullName}"`)

  const email = `tg_${tgId}@atte.local`
  const password = getUserPassword(tgId, botToken)

  // Step 1: Check if profile exists in profiles table
  console.log('[auth] Step 1: Checking if profile exists in profiles table...')
  const { data: existingUser, error: selectError } = await supabase
    .from(profiles.table)
    .select('id, company_id')
    .eq(profiles.tg_id, tgId)
    .single()

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('[auth] ✗ profiles.select error:', selectError)
    return res.status(500).json({ error: 'Database error' })
  }

  let companyId: string | null = null

  if (existingUser) {
    console.log(`[auth] ✓ Profile found: id=${existingUser.id}, company_id=${existingUser.company_id}`)
    companyId = existingUser.company_id
  } else {
    console.log('[auth] ✗ Profile not found, creating new company...')

    // Step 2: Create default company (profiles.company_id is NOT NULL — must create first)
    console.log('[auth] Step 2: Inserting into companies table...')
    const { data: newCompany, error: companyError } = await supabase
      .from(companies.table)
      .insert({
        [companies.name]: `${fullName}'s Workspace`,
        [companies.size_category]: 'micro',
        [companies.pricing_tier]: 'pending_micro',
      })
      .select('id')
      .single()

    if (companyError || !newCompany) {
      console.error('[auth] ✗ companies.insert error:', companyError)
      return res.status(500).json({ error: 'Failed to create company' })
    }

    companyId = newCompany.id
    console.log(`[auth] ✓ Company created: id=${companyId}`)

    // Step 3: Create Supabase auth user
    console.log('[auth] Step 3: Creating Supabase auth user (admin.createUser)...')
    const { data: authData, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        tg_id: tgId,
        full_name: fullName,
        username,
        role: 'employee',
      },
    })

    if (createErr && createErr.code !== 'user_already_exists') {
      console.error('[auth] ✗ createUser error:', createErr)
      // Orphan cleanup: company was created but auth failed — log for manual review
      console.error(`[auth] ⚠ Orphan company created: id=${companyId}. Auth user creation failed.`)
      return res.status(500).json({ error: createErr.message })
    }

    // Resolve userId: from createUser response OR via sign-in if user already existed in auth
    let userId: string | undefined
    if (!createErr) {
      userId = authData?.user?.id
      console.log(`[auth] ✓ Auth user created: id=${userId}`)
    } else {
      // user_already_exists — auth user exists but profile is missing (partial registration)
      // Resolve ID by signing in with the deterministic password
      console.log('[auth] ⚠ User already exists in auth, resolving ID via sign-in...')
      const { data: tempSession, error: tempSignInErr } = await supabase.auth.signInWithPassword({ email, password })
      userId = tempSession?.user?.id
      if (!userId) {
        console.error('[auth] ✗ Cannot resolve userId for orphaned auth user:', tempSignInErr)
      } else {
        console.log(`[auth] ✓ Resolved existing auth user id=${userId}`)
      }
    }

    if (userId) {
      console.log('[auth] Step 3b: Inserting into profiles table', { userId, tgId, fullName, companyId })
      const { error: profileError } = await supabase.from(profiles.table).insert({
        id: userId,
        [profiles.tg_id]: tgId,
        [profiles.full_name]: fullName,
        [profiles.role]: 'employee',
        [profiles.company_id]: companyId,
      })

      if (profileError) {
        console.error('[auth] ✗ profiles.insert error:', profileError)
        return res.status(500).json({ error: `Failed to create profile: ${profileError.message}` })
      } else {
        console.log('[auth] ✓ Profile inserted into profiles table')
      }
    }
  }

  // Step 4: Sign in to get session
  console.log('[auth] Step 4: Signing in (signInWithPassword) to generate session...')
  const { data: signInResult, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInErr) {
    console.error('[auth] ✗ signIn error:', signInErr)
    return res.status(500).json({ error: signInErr.message })
  }

  console.log(`[auth] ✓ Session generated, returning 200`)
  return res.status(200).json({
    session: signInResult.session,
    user: { tg_id: tgId, full_name: fullName, username, company_id: companyId },
    is_new_user: !existingUser,
  })
}

// ─── Handler (Vercel standard: req, res) ───────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> {
  console.log(`[auth] ▸ Incoming request: method=${req.method}`)

  try {
    // ── 1. Method check ─────────────────────────────────
    if (req.method !== 'POST') {
      console.warn('[auth] ✗ Non-POST method rejected with 405')
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const botToken = process.env.TG_BOT_TOKEN?.replace(/[^\x21-\x7E]/g, '')
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!botToken || !supabaseUrl || !serviceRoleKey) {
      console.error('[auth] ✗ Missing env vars (redacted)')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    console.log('[auth] ✓ Env vars present')

    // ── 2. Body check (VercelRequest.body is already parsed) ──
    const initData = req.body?.initData
    if (!initData || typeof initData !== 'string') {
      console.warn('[auth] ✗ Missing initData')
      return res.status(400).json({ error: 'Missing initData' })
    }

    console.log(`[auth] 1. Получили initData (length=${initData.length})`)

    // Disable background timers — prevents Vercel 300s timeout hang
    const supabase = createClient<any, 'public', any>(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Connection: 'close' } },
    })

    // ── 3. DEV MODE bypass (STRICT: blocked in production) ───────────────
    if (initData === 'DEV_MODE') {
      const env = process.env.VERCEL_ENV || process.env.NODE_ENV || ''
      console.log(`[auth] DEV_MODE detected, VERCEL_ENV="${env}"`)

      if (env === 'production') {
        console.error('[auth] ✗ DEV_MODE rejected in production!')
        return res.status(403).json({ error: 'Unauthorized: Dev mode disabled in production' })
      }

      console.warn('[auth] ✓ DEV MODE: local dev bypass activated')
      return await authUser(supabase, 111222333, 'Local Dev', 'local_dev', botToken, res)
    }

    // ── 4. Normal path: HMAC validation ──────────────────────────────────
    console.log('[auth] Step 2: Running HMAC validation...')
    if (!validateTelegramInitData(initData, botToken)) {
      console.warn('[auth] ✗ HMAC validation failed — 401')
      return res.status(401).json({ error: 'Invalid Telegram signature' })
    }

    console.log('[auth] 2. HMAC валидация успешна ✓')

    // Parse Telegram user
    console.log('[auth] Step 3: Parsing Telegram user data...')
    const urlParams = new URLSearchParams(initData)
    const userStr = urlParams.get('user')
    if (!userStr) {
      console.warn('[auth] ✗ No user data in initData')
      return res.status(400).json({ error: 'No user data in initData' })
    }

    let tgUser: { id: number; first_name: string; last_name?: string; username?: string }
    try {
      tgUser = JSON.parse(userStr)
    } catch {
      console.warn('[auth] ✗ Invalid user JSON')
      return res.status(400).json({ error: 'Invalid user JSON' })
    }

    console.log(`[auth] 3. Telegram user parsed: id=${tgUser.id}, name="${tgUser.first_name}"`)

    const tgId = tgUser.id
    const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ').trim() || `User ${tgId}`
    const username = tgUser.username || `user_${tgId}`

    console.log('[auth] Step 4: Calling authUser (Supabase create/signin)...')
    await authUser(supabase, tgId, fullName, username, botToken, res)
  } catch (error: any) {
    // ── 5. Global catch-all: NEVER hang without a response ──────────────
    console.error('[auth] ✗✗✗ UNHANDLED ERROR (500):', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  } finally {
    // Force Node.js event loop to exit — prevents Vercel 300s timeout hang
    // This is safe because all work is done and response is already sent.
    console.log('[auth] Finally: request handled, letting Vercel finish...')
  }
}
