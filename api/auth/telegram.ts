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

export const config = { runtime: 'nodejs' }

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

// ─── DB Schema (Law of Truth — synced with BRIEF.md) ────────────────────────

const DB_SCHEMA = {
  users: {
    table: 'users',
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

  const hash = paramsMap.get('hash') || paramsMap.get('signature')
  if (!hash) {
    console.warn('[auth] ✗ No hash or signature in initData')
    return false
  }

  paramsMap.delete('hash')
  paramsMap.delete('signature')

  const keys = Array.from(paramsMap.keys()).sort()
  const dataCheckString = keys.map(key => `${key}=${paramsMap.get(key)}`).join('\n')

  console.log('[auth] DataCheckString keys (sorted):', keys.join(', '))
  console.log('[auth] DataCheckString (full):\n' + dataCheckString)
  console.log('[auth] DataCheckString (base64):', Buffer.from(dataCheckString).toString('base64'))
  console.log('[auth] Hash received (full):', hash)

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  console.log('[auth] Hash calculated (full):', calculatedHash)
  console.log('[auth] Raw Crypto:', { received: hash.slice(0, 5), calculated: calculatedHash.slice(0, 5) })

  return calculatedHash === hash
}

// ─── Deterministic password (same for same user, never changes) ─────────────

function getUserPassword(tgId: number, botToken: string): string {
  return hmacSHA256(botToken, `shadow_pw_${tgId}`).toString('hex')
}

// ─── Core logic: create or find user, return session ────────────────────────

async function authUser(
  supabase: any,
  tgId: number,
  fullName: string,
  username: string,
  botToken: string,
): Promise<Response> {
  const { users, companies } = DB_SCHEMA
  console.log(`[auth] → authUser called: tgId=${tgId}, fullName="${fullName}"`)

  const email = `tg_${tgId}@atte.local`
  const password = getUserPassword(tgId, botToken)

  // Step 1: Check if profile exists
  console.log('[auth] Step 1: Checking if profile exists in users table...')
  const { data: existingUser, error: selectError } = await supabase
    .from(users.table)
    .select('id, company_id')
    .eq(users.tg_id, tgId)
    .single()

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('[auth] ✗ users.select error:', selectError)
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })
  }

  let companyId: string | null = null

  if (existingUser) {
    console.log(`[auth] ✓ Profile found: id=${existingUser.id}, company_id=${existingUser.company_id}`)
    companyId = existingUser.company_id
  } else {
    console.log('[auth] ✗ Profile not found, creating new company...')

    // Step 2: Create default company
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
      return new Response(JSON.stringify({ error: 'Failed to create company' }), { status: 500 })
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
        role: 'employee',  // default role (lowercase)
      },
    })

    if (createErr && createErr.code !== 'user_already_exists') {
      console.error('[auth] ✗ createUser error:', createErr)
      return new Response(JSON.stringify({ error: createErr.message }), { status: 500 })
    }

    if (createErr?.code === 'user_already_exists') {
      console.log('[auth] ⚠ User already exists in auth, skipping create')
    } else {
      console.log(`[auth] ✓ Auth user created: id=${authData?.user?.id}`)
    }

    const userId = authData?.user?.id

    if (userId) {
      console.log('[auth] Step 3b: Profile data', { userId, tgId, fullName, companyId })
      const { error: profileError } = await supabase.from(users.table).insert({
        id: userId,
        [users.tg_id]: tgId,
        [users.full_name]: fullName,
        [users.role]: 'employee',
        [users.company_id]: companyId,
      })

      if (profileError) {
        console.error('[auth] ✗ users.insert error:', profileError)
        // Non-fatal: user exists in auth, can be fixed later
      } else {
        console.log('[auth] ✓ User profile inserted')
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
    return new Response(JSON.stringify({ error: signInErr.message }), { status: 500 })
  }

  console.log(`[auth] ✓ Session generated, returning 200`)
  return new Response(
    JSON.stringify({
      session: signInResult.session,
      user: { tg_id: tgId, full_name: fullName, username, company_id: companyId },
      is_new_user: !existingUser,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

// ─── Handler ───────────────────────────────────────────────────────────────

export default async function handler(req: Request): Promise<Response> {
  console.log(`[auth] ▸ Incoming request: method=${req.method}, url=${req.url}`)

  try {
    // ── 1. Method check (must come FIRST) ─────────────────────────────────
    if (req.method !== 'POST') {
      console.warn('[auth] ✗ Non-POST method rejected with 405')
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
    }

    // Strip ALL non-printable / non-ASCII chars — .trim() misses invisible Unicode
    const botToken = process.env.TG_BOT_TOKEN?.replace(/[^\x21-\x7E]/g, '')
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!botToken || !supabaseUrl || !serviceRoleKey) {
      console.error('[auth] ✗ Missing env vars (redacted)')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 })
    }

    console.log('[auth] BotToken diagnostic:', {
      rawLen: process.env.TG_BOT_TOKEN?.length,
      cleanLen: botToken.length,
      hasInvisible: process.env.TG_BOT_TOKEN?.length !== botToken.length,
      botId: botToken.split(':')[0],
      preview: botToken.slice(0, 6) + '...' + botToken.slice(-4),
    })

    console.log('[auth] ✓ Env vars present')

    // ── 2. Body parsing (Node.js stream read — guaranteed to work) ────
    let body: { initData?: string }
    try {
      const chunks: Buffer[] = []
      for await (const chunk of req as unknown as AsyncIterable<Buffer>) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
      }
      const rawBody = Buffer.concat(chunks).toString('utf-8')
      console.log('[auth] Raw body received (first 100 chars):', rawBody.slice(0, 100))

      if (!rawBody || rawBody.length === 0) {
        console.warn('[auth] ✗ Empty request body stream')
        return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 })
      }

      body = JSON.parse(rawBody)
    } catch (e: any) {
      console.error('[auth] Body read / JSON Parse Error:', e.message)
      return new Response(JSON.stringify({ error: 'Invalid JSON body', detail: e.message }), { status: 400 })
    }

    const { initData } = body
    if (!initData || typeof initData !== 'string') {
      console.warn('[auth] ✗ Missing initData')
      return new Response(JSON.stringify({ error: 'Missing initData' }), { status: 400 })
    }

    console.log(`[auth] 1. Получили initData (length=${initData.length}, starts_with="${initData.slice(0, 20)}...")`)
    console.log('[auth] initData (full):', initData)

    const supabase = createClient<any, 'public', any>(supabaseUrl, serviceRoleKey)

    // ── 3. DEV MODE bypass (STRICT: blocked in production) ───────────────
    if (initData === 'DEV_MODE') {
      const env = process.env.VERCEL_ENV || process.env.NODE_ENV || ''
      console.log(`[auth] DEV_MODE detected, VERCEL_ENV="${env}"`)

      if (env === 'production') {
        console.error('[auth] ✗ DEV_MODE rejected in production!')
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Dev mode disabled in production' }),
          { status: 403 }
        )
      }

      console.warn('[auth] ✓ DEV MODE: local dev bypass activated')
      return await authUser(supabase, 111222333, 'Local Dev', 'local_dev', botToken)
    }

    // ── 4. Normal path: HMAC validation ──────────────────────────────────
    console.log('[auth] Step 2: Running HMAC validation...')
    if (!validateTelegramInitData(initData, botToken)) {
      console.warn('[auth] ✗ HMAC validation failed — 401')
      return new Response(JSON.stringify({ error: 'Invalid Telegram signature' }), { status: 401 })
    }

    console.log('[auth] 2. HMAC валидация успешна ✓')

    // Parse Telegram user
    console.log('[auth] Step 3: Parsing Telegram user data...')
    const urlParams = new URLSearchParams(initData)
    const userStr = urlParams.get('user')
    if (!userStr) {
      console.warn('[auth] ✗ No user data in initData')
      return new Response(JSON.stringify({ error: 'No user data in initData' }), { status: 400 })
    }

    let tgUser: { id: number; first_name: string; last_name?: string; username?: string }
    try {
      tgUser = JSON.parse(userStr)
    } catch {
      console.warn('[auth] ✗ Invalid user JSON')
      return new Response(JSON.stringify({ error: 'Invalid user JSON' }), { status: 400 })
    }

    console.log(`[auth] 3. Telegram user parsed: id=${tgUser.id}, name="${tgUser.first_name}"`)

    const tgId = tgUser.id
    const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ').trim() || `User ${tgId}`
    const username = tgUser.username || `user_${tgId}`

    console.log('[auth] Step 4: Calling authUser (Supabase create/signin)...')
    return await authUser(supabase, tgId, fullName, username, botToken)
  } catch (error: any) {
    // ── 5. Global catch-all: NEVER hang without a response ──────────────
    console.error('[auth] ✗✗✗ UNHANDLED ERROR (500):', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
}
