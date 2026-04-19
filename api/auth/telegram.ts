/**
 * Vercel Serverless Function — Telegram Shadow Auth
 *
 * Flow:
 *   1. Validate HMAC-SHA-256 from Telegram initData
 *   2. Try signInWithPassword (fast path for existing users)
 *   3. If user exists in auth but profile is missing → create company + profile
 *   4. If user doesn't exist → create company, auth user, profile, then sign in
 *
 * profiles table columns: id, company_id, full_name, role, department, job_title, profile_id, created_at
 * NOTE: No tg_id column — users are identified by auth email tg_<id>@atte.local
 *
 * Env vars: TG_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { createHmac, randomUUID } from 'crypto'

export const config = { runtime: 'nodejs' }

// ─── DB Schema ───────────────────────────────────────────────────────────────

const DB_SCHEMA = {
  profiles: {
    table: 'profiles',
    full_name: 'full_name',
    company_id: 'company_id',
    role: 'role',
  },
  companies: {
    table: 'companies',
    name: 'name',
  },
} as const

// ─── HMAC Validation ─────────────────────────────────────────────────────────

function hmacSHA256(key: string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest()
}

function validateTelegramInitData(initData: string, botToken: string): boolean {
  const paramsMap = new Map<string, string>()

  initData.split('&').forEach(pair => {
    const index = pair.indexOf('=')
    if (index === -1) return
    paramsMap.set(pair.slice(0, index), decodeURIComponent(pair.slice(index + 1)))
  })

  const hash = paramsMap.get('hash')
  if (!hash) return false

  paramsMap.delete('hash')

  const dataCheckString = Array.from(paramsMap.keys())
    .sort()
    .map(key => `${key}=${paramsMap.get(key)}`)
    .join('\n')

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  return calculatedHash === hash
}

// ─── Deterministic shadow password ───────────────────────────────────────────

function getUserPassword(tgId: number, botToken: string): string {
  return hmacSHA256(botToken, `shadow_pw_${tgId}`).toString('hex')
}

// ─── Create company + profile (shared helper) ────────────────────────────────

async function createCompanyAndProfile(
  supabase: any,
  userId: string,
  fullName: string,
  role: 'manager' | 'employee' = 'employee',
): Promise<{ companyId: string } | { error: string; _code?: string }> {
  const { profiles, companies } = DB_SCHEMA

  const { data: newCompany, error: companyError } = await supabase
    .from(companies.table)
    .insert({
      id: randomUUID(),
      [companies.name]: `${fullName}'s Workspace`,
      industry: 'other',
      size_total: 1,
      size_office: 1,
      tariff: 'premium',
      hourly_rate: 1000,
    })
    .select('id')
    .single()

  if (companyError || !newCompany) {
    console.error('[auth] ✗ companies.insert error:', companyError)
    return { error: `Failed to create company: ${companyError?.code} ${companyError?.message}`, _code: companyError?.code }
  }

  const companyId = newCompany.id
  console.log(`[auth] ✓ Company created: id=${companyId}`)

  const { error: profileError } = await supabase.from(profiles.table).insert({
    id: userId,
    [profiles.full_name]: fullName,
    [profiles.role]: role,
    [profiles.company_id]: companyId,
  })

  if (profileError) {
    console.error('[auth] ✗ profiles.insert error:', profileError)
    return { error: `Failed to create profile: ${profileError.message}`, _code: profileError.code }
  }

  console.log('[auth] ✓ Profile inserted')
  return { companyId }
}

// ─── Core auth logic ─────────────────────────────────────────────────────────

async function authUser(
  supabase: any,
  tgId: number,
  fullName: string,
  username: string,
  botToken: string,
  res: VercelResponse,
): Promise<VercelResponse | void> {
  const { profiles } = DB_SCHEMA
  const email = `tg_${tgId}@atte.local`
  const password = getUserPassword(tgId, botToken)

  console.log(`[auth] → authUser: tgId=${tgId}, email=${email}`)

  // ── Step 1: Try signing in (fast path for existing users) ─────────────────
  console.log('[auth] Step 1: Trying signInWithPassword...')
  const { data: signInResult, error: signInErr } = await supabase.auth.signInWithPassword({ email, password })

  if (signInResult?.session) {
    const userId = signInResult.user.id
    console.log(`[auth] ✓ Auth user found: id=${userId}`)

    // Check if profile row exists
    const { data: existingProfile, error: profileSelectErr } = await supabase
      .from(profiles.table)
      .select('id, company_id')
      .eq('id', userId)
      .single()

    if (profileSelectErr && profileSelectErr.code !== 'PGRST116') {
      console.error('[auth] ✗ profiles.select error:', profileSelectErr)
      return res.status(500).json({ error: 'Database error', _code: profileSelectErr.code, _hint: profileSelectErr.message })
    }

    if (existingProfile) {
      // Happy path — existing user with profile
      console.log(`[auth] ✓ Profile found, company_id=${existingProfile.company_id}`)
      return res.status(200).json({
        session: signInResult.session,
        user: { tg_id: tgId, full_name: fullName, username, company_id: existingProfile.company_id },
        is_new_user: false,
      })
    }

    // Auth user exists but profile is missing (partial registration) — repair it
    console.log('[auth] ⚠ Profile missing for existing auth user, creating...')
    const result = await createCompanyAndProfile(supabase, userId, fullName, 'manager')
    if ('error' in result) {
      return res.status(500).json(result)
    }

    return res.status(200).json({
      session: signInResult.session,
      user: { tg_id: tgId, full_name: fullName, username, company_id: result.companyId },
      is_new_user: true,
    })
  }

  // ── Step 2: New user — create everything ──────────────────────────────────
  console.log(`[auth] Step 2: New user (signIn error: ${signInErr?.message}). Creating auth user...`)

  const { data: authData, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { tg_id: tgId, full_name: fullName, username, role: 'employee' },
  })

  if (createErr) {
    console.error('[auth] ✗ admin.createUser error:', createErr)
    return res.status(500).json({ error: createErr.message, _code: createErr.code })
  }

  const userId = authData.user.id
  console.log(`[auth] ✓ Auth user created: id=${userId}`)

  // Create company + profile — first user always gets manager role
  const result = await createCompanyAndProfile(supabase, userId, fullName, 'manager')
  if ('error' in result) {
    return res.status(500).json(result)
  }

  // Sign in to get a real session token
  console.log('[auth] Step 3: Signing in to get session...')
  const { data: finalSignIn, error: finalSignInErr } = await supabase.auth.signInWithPassword({ email, password })

  if (finalSignInErr || !finalSignIn?.session) {
    console.error('[auth] ✗ Final signIn error:', finalSignInErr)
    return res.status(500).json({ error: finalSignInErr?.message || 'Sign-in failed after registration' })
  }

  console.log('[auth] ✓ Session generated for new user')
  return res.status(200).json({
    session: finalSignIn.session,
    user: { tg_id: tgId, full_name: fullName, username, company_id: result.companyId },
    is_new_user: true,
  })
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> {
  console.log(`[auth] ▸ ${req.method}`)

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const botToken = process.env.TG_BOT_TOKEN?.replace(/[^\x21-\x7E]/g, '')
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!botToken || !supabaseUrl || !serviceRoleKey) {
      console.error('[auth] ✗ Missing env vars')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const initData = req.body?.initData
    if (!initData || typeof initData !== 'string') {
      return res.status(400).json({ error: 'Missing initData' })
    }

    const supabase = createClient<any, 'public', any>(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      },
    })

    // DEV MODE (blocked in production)
    if (initData === 'DEV_MODE') {
      const env = process.env.VERCEL_ENV || process.env.NODE_ENV || ''
      if (env === 'production') {
        return res.status(403).json({ error: 'Unauthorized: Dev mode disabled in production' })
      }
      console.warn('[auth] ✓ DEV MODE activated')
      return await authUser(supabase, 111222333, 'Local Dev', 'local_dev', botToken, res)
    }

    // HMAC validation
    if (!validateTelegramInitData(initData, botToken)) {
      console.warn('[auth] ✗ HMAC failed')
      return res.status(401).json({ error: 'Invalid Telegram signature' })
    }

    // Parse Telegram user
    const urlParams = new URLSearchParams(initData)
    const userStr = urlParams.get('user')
    if (!userStr) {
      return res.status(400).json({ error: 'No user data in initData' })
    }

    let tgUser: { id: number; first_name: string; last_name?: string; username?: string }
    try {
      tgUser = JSON.parse(userStr)
    } catch {
      return res.status(400).json({ error: 'Invalid user JSON' })
    }

    const tgId = tgUser.id
    const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ').trim() || `User ${tgId}`
    const username = tgUser.username || `user_${tgId}`

    await authUser(supabase, tgId, fullName, username, botToken, res)
  } catch (error: any) {
    console.error('[auth] ✗✗✗ UNHANDLED ERROR:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
