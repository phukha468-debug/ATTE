/**
 * Vercel Serverless Function — Company Setup
 *
 * PATCH /api/company/setup
 * Body: { name: string }
 * Auth: Bearer token from Supabase session
 *
 * Called once during onboarding to set the real company name.
 */

import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'PATCH') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 })
  }

  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing auth token' }), { status: 401 })
  }

  const token = authHeader.split(' ')[1]
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 })
  }

  let body: { name?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  const name = body.name?.trim()
  if (!name || name.length < 2) {
    return new Response(JSON.stringify({ error: 'Company name must be at least 2 characters' }), { status: 400 })
  }

  const db = createClient(supabaseUrl, serviceRoleKey)

  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.company_id) {
    return new Response(JSON.stringify({ error: 'Profile or company not found' }), { status: 404 })
  }

  const { error: updateError } = await db
    .from('companies')
    .update({ name })
    .eq('id', profile.company_id)

  if (updateError) {
    console.error('[company/setup] Update error:', updateError)
    return new Response(JSON.stringify({ error: 'Failed to update company name' }), { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
