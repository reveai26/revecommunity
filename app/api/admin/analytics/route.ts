import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// 디바이스 타입 감지
function getDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
  const ua = userAgent.toLowerCase()
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

// POST: 페이지 뷰 트래킹
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, page_title, referrer, session_id, visitor_id, is_new_visitor } = body

    const supabase = createServerClient()
    const userAgent = request.headers.get('user-agent') || ''
    const deviceType = getDeviceType(userAgent)

    // 현재 로그인한 사용자 확인
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.from('page_views').insert({
      path,
      page_title,
      referrer,
      user_agent: userAgent,
      device_type: deviceType,
      session_id,
      visitor_id,
      is_new_visitor: is_new_visitor || false,
      user_id: user?.id || null,
    }).select('id').single()

    if (error) {
      console.error('Page view tracking error:', error)
      return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Page view tracking error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}

// GET: 분석 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'

    // 관리자 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users_profile')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 날짜 범위 계산
    const days = range === '30d' ? 30 : range === '90d' ? 90 : 7
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 전체 페이지 뷰 데이터 가져오기
    const { data: pageViews, error } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Analytics query error:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    // 기본 통계
    const totalPageViews = pageViews?.length || 0
    const uniqueSessions = new Set(pageViews?.map(pv => pv.session_id).filter(Boolean)).size
    const uniqueVisitors = new Set(pageViews?.map(pv => pv.visitor_id).filter(Boolean)).size

    // 신규 vs 재방문자
    const newVisitors = pageViews?.filter(pv => pv.is_new_visitor).length || 0
    const returningVisitors = totalPageViews - newVisitors

    // 평균 체류 시간 계산 (duration > 0인 것만)
    const durationsWithValue = pageViews?.filter(pv => pv.duration > 0).map(pv => pv.duration) || []
    const avgDuration = durationsWithValue.length > 0
      ? Math.round(durationsWithValue.reduce((a, b) => a + b, 0) / durationsWithValue.length)
      : 0

    // 이탈률 계산 (세션당 1페이지만 본 비율)
    const sessionPageCounts: Record<string, number> = {}
    pageViews?.forEach(pv => {
      if (pv.session_id) {
        sessionPageCounts[pv.session_id] = (sessionPageCounts[pv.session_id] || 0) + 1
      }
    })
    const totalSessions = Object.keys(sessionPageCounts).length
    const singlePageSessions = Object.values(sessionPageCounts).filter(count => count === 1).length
    const bounceRate = totalSessions > 0 ? Math.round((singlePageSessions / totalSessions) * 100) : 0

    // 일별 방문자 통계
    const dailyStats: Record<string, { visitors: Set<string>, pageViews: number, newVisitors: number }> = {}
    pageViews?.forEach(pv => {
      const date = new Date(pv.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
      if (!dailyStats[date]) {
        dailyStats[date] = { visitors: new Set(), pageViews: 0, newVisitors: 0 }
      }
      if (pv.session_id) dailyStats[date].visitors.add(pv.session_id)
      dailyStats[date].pageViews++
      if (pv.is_new_visitor) dailyStats[date].newVisitors++
    })

    const dailyVisitors = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        visitors: stats.visitors.size,
        pageViews: stats.pageViews,
        newVisitors: stats.newVisitors,
      }))
      .sort((a, b) => {
        const [aMonth, aDay] = a.date.split('/').map(Number)
        const [bMonth, bDay] = b.date.split('/').map(Number)
        return aMonth - bMonth || aDay - bDay
      })
      .slice(-days)

    // 시간대별 트래픽 (24시간)
    const hourlyStats: number[] = new Array(24).fill(0)
    pageViews?.forEach(pv => {
      const hour = new Date(pv.created_at).getHours()
      hourlyStats[hour]++
    })

    // 인기 페이지 통계
    const pageStats: Record<string, { views: number, avgDuration: number, durations: number[] }> = {}
    pageViews?.forEach(pv => {
      if (!pageStats[pv.path]) {
        pageStats[pv.path] = { views: 0, avgDuration: 0, durations: [] }
      }
      pageStats[pv.path].views++
      if (pv.duration > 0) {
        pageStats[pv.path].durations.push(pv.duration)
      }
    })

    // 각 페이지의 평균 체류시간 계산
    Object.values(pageStats).forEach(stat => {
      if (stat.durations.length > 0) {
        stat.avgDuration = Math.round(stat.durations.reduce((a, b) => a + b, 0) / stat.durations.length)
      }
    })

    const topPages = Object.entries(pageStats)
      .sort((a, b) => b[1].views - a[1].views)
      .slice(0, 10)
      .map(([path, stats]) => ({
        path,
        title: getPageTitle(path),
        views: stats.views,
        percentage: totalPageViews > 0 ? Math.round((stats.views / totalPageViews) * 100) : 0,
        avgDuration: stats.avgDuration,
      }))

    // 디바이스 통계
    const deviceStats: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 }
    pageViews?.forEach(pv => {
      if (pv.device_type) {
        deviceStats[pv.device_type] = (deviceStats[pv.device_type] || 0) + 1
      }
    })
    const totalDevices = Object.values(deviceStats).reduce((a, b) => a + b, 0)
    const deviceData = [
      { device: 'Mobile', count: deviceStats.mobile, percentage: totalDevices > 0 ? Math.round((deviceStats.mobile / totalDevices) * 100) : 0 },
      { device: 'Desktop', count: deviceStats.desktop, percentage: totalDevices > 0 ? Math.round((deviceStats.desktop / totalDevices) * 100) : 0 },
      { device: 'Tablet', count: deviceStats.tablet, percentage: totalDevices > 0 ? Math.round((deviceStats.tablet / totalDevices) * 100) : 0 },
    ]

    // 유입 경로 통계
    const referrerStats: Record<string, number> = {}
    pageViews?.forEach(pv => {
      const source = categorizeReferrer(pv.referrer)
      referrerStats[source] = (referrerStats[source] || 0) + 1
    })
    const totalReferrers = Object.values(referrerStats).reduce((a, b) => a + b, 0)
    const trafficSources = Object.entries(referrerStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count], index) => ({
        source,
        visitors: count,
        percentage: totalReferrers > 0 ? Math.round((count / totalReferrers) * 100) : 0,
        color: getColorForIndex(index)
      }))

    // 이전 기간 대비 변화율 계산
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - days)

    const { data: previousPageViews } = await supabase
      .from('page_views')
      .select('session_id, visitor_id')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString())

    const previousTotalViews = previousPageViews?.length || 0
    const previousUniqueSessions = new Set(previousPageViews?.map(pv => pv.session_id).filter(Boolean)).size
    const previousUniqueVisitors = new Set(previousPageViews?.map(pv => pv.visitor_id).filter(Boolean)).size

    const visitorsChange = previousUniqueSessions > 0
      ? Math.round(((uniqueSessions - previousUniqueSessions) / previousUniqueSessions) * 100 * 10) / 10
      : 0
    const pageViewsChange = previousTotalViews > 0
      ? Math.round(((totalPageViews - previousTotalViews) / previousTotalViews) * 100 * 10) / 10
      : 0

    // 실시간 현재 접속자 (최근 5분 이내 활동)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: realtimeViews } = await supabase
      .from('page_views')
      .select('session_id')
      .gte('created_at', fiveMinutesAgo)

    const realtimeVisitors = new Set(realtimeViews?.map(pv => pv.session_id).filter(Boolean)).size

    return NextResponse.json({
      // 기본 통계
      totalVisitors: uniqueSessions,
      uniqueVisitors,
      totalPageViews,
      visitorsChange,
      pageViewsChange,

      // 체류 시간 & 이탈률
      avgDuration,
      bounceRate,

      // 신규/재방문
      newVisitors,
      returningVisitors,
      newVisitorPercentage: totalPageViews > 0 ? Math.round((newVisitors / totalPageViews) * 100) : 0,

      // 실시간
      realtimeVisitors,

      // 차트 데이터
      dailyVisitors,
      hourlyStats,
      topPages,
      deviceStats: deviceData,
      trafficSources,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

function getPageTitle(path: string): string {
  const titles: Record<string, string> = {
    '/': '홈페이지',
    '/free': '자유게시판',
    '/it-ai': 'IT&AI',
    '/login': '로그인',
    '/signup': '회원가입',
    '/admin': '관리자 대시보드',
    '/admin/analytics': '방문자 분석',
    '/admin/members': '회원관리',
    '/admin/saas-spark': 'SaaS Spark',
    '/profile': '프로필',
    '/settings': '설정',
  }

  // 동적 라우트 처리
  if (path.startsWith('/it-ai/')) return 'IT&AI 콘텐츠'
  if (path.startsWith('/free/')) return '자유게시판 글'
  if (path.startsWith('/profile/')) return '사용자 프로필'

  return titles[path] || path
}

function categorizeReferrer(referrer: string | null): string {
  if (!referrer) return '직접 방문'
  const r = referrer.toLowerCase()
  if (r.includes('google')) return 'Google'
  if (r.includes('naver')) return 'Naver'
  if (r.includes('daum')) return 'Daum'
  if (r.includes('bing')) return 'Bing'
  if (r.includes('instagram')) return 'Instagram'
  if (r.includes('facebook') || r.includes('fb.')) return 'Facebook'
  if (r.includes('twitter') || r.includes('t.co') || r.includes('x.com')) return 'X (Twitter)'
  if (r.includes('youtube')) return 'YouTube'
  if (r.includes('linkedin')) return 'LinkedIn'
  if (r.includes('threads')) return 'Threads'
  return '기타'
}

function getColorForIndex(index: number): string {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500', 'bg-purple-500', 'bg-orange-500', 'bg-cyan-500', 'bg-red-500']
  return colors[index % colors.length]
}
