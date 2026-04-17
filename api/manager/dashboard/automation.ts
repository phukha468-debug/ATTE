/**
 * Vercel Serverless Function — Manager Dashboard Automation Map
 * GET /api/manager/dashboard/automation
 */

import { createClient } from '@supabase/supabase-js'
import { verifyManagerAuth } from '../../_lib/auth'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const auth = await verifyManagerAuth(req)
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    }

    const { companyId } = auth
    const supabaseUrl = process.env.SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // 1. Получаем почасовую ставку компании
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('hourly_rate')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      console.error('[automation] Company fetch error:', companyError)
      return new Response(JSON.stringify({ error: 'Failed to fetch company data' }), { status: 500 })
    }

    const hourlyRate = company.hourly_rate || 1000

    // 2. Получаем карту автоматизации через RPC
    const { data: tasks, error: rpcError } = await supabase.rpc('automation_map', {
      p_company_id: companyId
    })

    if (rpcError) {
      console.error('[automation] automation_map RPC error:', rpcError)
      return new Response(JSON.stringify({ error: 'Failed to fetch automation map' }), { status: 500 })
    }

    // 3. Пересчитываем часы в деньги для каждой задачи
    const enrichedTasks = (tasks || []).map((task: any) => ({
      ...task,
      money_savings: (task.validated_hours || 0) * hourlyRate
    }))

    return new Response(JSON.stringify({ tasks: enrichedTasks }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    console.error('[automation] Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: err.message }), { status: 500 })
  }
}
