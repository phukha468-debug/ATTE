/**
 * Vercel Serverless Function — Manager Dashboard Summary
 * GET /api/manager/dashboard/summary
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

    // 1. Получаем данные компании (особенно почасовую ставку)
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      console.error('[summary] Company fetch error:', companyError)
      return new Response(JSON.stringify({ error: 'Failed to fetch company data' }), { status: 500 })
    }

    const hourlyRate = company.hourly_rate || 1000 // Дефолтное значение, если не задано

    // 2. Вызываем RPC-функции параллельно
    const [
      avgGradeRes,
      distRes,
      savingsRes,
      stage2Res
    ] = await Promise.all([
      supabase.rpc('avg_grade_by_company', { p_company_id: companyId }),
      supabase.rpc('grade_distribution', { p_company_id: companyId }),
      supabase.rpc('total_savings', { p_company_id: companyId }),
      supabase.rpc('avg_stage2_scores', { p_company_id: companyId })
    ])

    // Логируем ошибки RPC, если есть
    if (avgGradeRes.error) console.error('[summary] avg_grade_by_company error:', avgGradeRes.error)
    if (distRes.error) console.error('[summary] grade_distribution error:', distRes.error)
    if (savingsRes.error) console.error('[summary] total_savings error:', savingsRes.error)
    if (stage2Res.error) console.error('[summary] avg_stage2_scores error:', stage2Res.error)

    const hoursSaved = savingsRes.data || 0
    const moneySaved = hoursSaved * hourlyRate
    const fteSaved = Number((hoursSaved / 160).toFixed(2))

    const responseData = {
      summary: {
        avg_grade: avgGradeRes.data || 0,
        total_hours_saved: hoursSaved,
        total_money_saved: moneySaved,
        fte_saved: fteSaved,
      },
      distribution: distRes.data || [],
      stage2_avg: stage2Res.data || {
        prompting: 0,
        iteration: 0,
        speedup: 0,
        quality: 0,
        limitations: 0
      },
      company: {
        name: company.name,
        hourly_rate: hourlyRate
      }
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    console.error('[summary] Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: err.message }), { status: 500 })
  }
}
