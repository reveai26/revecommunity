import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  // Admin API는 service_role key 사용 (RLS 우회)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    // Fallback to anon key if service role not available
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    // 전체 회원 수 조회
    const { count: totalCount } = await supabase
      .from('users_profile')
      .select('*', { count: 'exact', head: true })

    // 회원 목록 조회
    let query = supabase
      .from('users_profile')
      .select('*')
      .order('created_at', { ascending: false })

    // 검색 필터
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // 상태 필터 (subscription_tier 기반)
    if (status !== 'all') {
      if (status === 'active') {
        query = query.neq('subscription_tier', 'free')
      } else if (status === 'free') {
        query = query.eq('subscription_tier', 'free')
      }
    }

    // 페이지네이션
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: members, error } = await query

    if (error) {
      throw error
    }

    // 월별 가입자 통계 (최근 6개월)
    const monthlyStats = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const { count } = await supabase
        .from('users_profile')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())

      monthlyStats.push({
        month: `${date.getMonth() + 1}월`,
        count: count || 0,
      })
    }

    // 구독 티어별 통계
    const tierStats = {
      free: 0,
      basic: 0,
      pro: 0,
      max: 0,
    }

    const { data: allMembers } = await supabase
      .from('users_profile')
      .select('subscription_tier')

    allMembers?.forEach((m) => {
      const tier = m.subscription_tier as keyof typeof tierStats
      if (tier in tierStats) {
        tierStats[tier]++
      }
    })

    return NextResponse.json({
      success: true,
      members,
      totalCount: totalCount || 0,
      monthlyStats,
      tierStats,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Members fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members', details: String(error) },
      { status: 500 }
    )
  }
}
