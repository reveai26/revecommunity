'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  Users,
  Eye,
  Clock,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  Loader2,
  UserPlus,
  UserCheck,
  Activity,
  Globe,
} from 'lucide-react'

interface DailyVisitor {
  date: string
  visitors: number
  pageViews: number
  newVisitors: number
}

interface TopPage {
  path: string
  title: string
  views: number
  percentage: number
  avgDuration: number
}

interface DeviceStat {
  device: string
  count: number
  percentage: number
}

interface TrafficSource {
  source: string
  visitors: number
  percentage: number
  color: string
}

interface AnalyticsData {
  totalVisitors: number
  uniqueVisitors: number
  totalPageViews: number
  visitorsChange: number
  pageViewsChange: number
  avgDuration: number
  bounceRate: number
  newVisitors: number
  returningVisitors: number
  newVisitorPercentage: number
  realtimeVisitors: number
  dailyVisitors: DailyVisitor[]
  hourlyStats: number[]
  topPages: TopPage[]
  deviceStats: DeviceStat[]
  trafficSources: TrafficSource[]
}

const deviceIcons: Record<string, typeof Smartphone> = {
  Mobile: Smartphone,
  Desktop: Monitor,
  Tablet: Tablet,
}

const deviceColors: Record<string, string> = {
  Mobile: 'text-blue-400',
  Desktop: 'text-green-400',
  Tablet: 'text-purple-400',
}

// 초를 mm:ss 형식으로 변환
function formatDuration(seconds: number): string {
  if (seconds === 0) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}초`
  return `${mins}분 ${secs}초`
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AnalyticsData | null>(null)

  const fetchAnalytics = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true)
    else setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`)
      if (!response.ok) {
        if (response.status === 401) throw new Error('로그인이 필요합니다.')
        if (response.status === 403) throw new Error('관리자 권한이 필요합니다.')
        throw new Error('데이터를 불러오는데 실패했습니다.')
      }
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // 30초마다 자동 새로고침
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics(true)
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchAnalytics])

  const handleRefresh = () => {
    fetchAnalytics(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => fetchAnalytics()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          다시 시도
        </button>
      </div>
    )
  }

  const maxVisitors = data?.dailyVisitors?.length
    ? Math.max(...data.dailyVisitors.map((d) => d.visitors), 1)
    : 1

  const maxHourly = data?.hourlyStats?.length
    ? Math.max(...data.hourlyStats, 1)
    : 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-500" />
            방문자 분석
          </h1>
          <p className="text-gray-400 mt-1">실시간 트래픽 현황</p>
        </div>
        <div className="flex items-center gap-3">
          {/* 실시간 접속자 */}
          <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 font-medium">{data?.realtimeVisitors || 0}</span>
            <span className="text-gray-400 text-sm hidden sm:inline">실시간</span>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 outline-none"
          >
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
            <option value="90d">최근 90일</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">총 방문자</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                {(data?.totalVisitors || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-600 rounded-lg">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <div className={`flex items-center gap-1 mt-2 sm:mt-3 text-xs sm:text-sm ${(data?.visitorsChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(data?.visitorsChange || 0) >= 0 ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span>{(data?.visitorsChange || 0) >= 0 ? '+' : ''}{data?.visitorsChange || 0}%</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">페이지뷰</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                {(data?.totalPageViews || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-600 rounded-lg">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <div className={`flex items-center gap-1 mt-2 sm:mt-3 text-xs sm:text-sm ${(data?.pageViewsChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(data?.pageViewsChange || 0) >= 0 ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span>{(data?.pageViewsChange || 0) >= 0 ? '+' : ''}{data?.pageViewsChange || 0}%</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">평균 체류시간</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                {formatDuration(data?.avgDuration || 0)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-600 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 sm:mt-3 text-gray-400 text-xs sm:text-sm">
            <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>페이지당</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">이탈률</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">{data?.bounceRate || 0}%</p>
            </div>
            <div className="p-2 sm:p-3 bg-orange-600 rounded-lg">
              <MousePointer className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 sm:mt-3 text-gray-400 text-xs sm:text-sm">
            <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>단일 페이지</span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Row 2: 신규/재방문 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-600/20 rounded-lg">
                <UserPlus className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">신규 방문자</p>
                <p className="text-lg sm:text-xl font-bold text-white">{(data?.newVisitors || 0).toLocaleString()}</p>
              </div>
            </div>
            <span className="text-cyan-400 font-medium">{data?.newVisitorPercentage || 0}%</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/20 rounded-lg">
                <UserCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">재방문자</p>
                <p className="text-lg sm:text-xl font-bold text-white">{(data?.returningVisitors || 0).toLocaleString()}</p>
              </div>
            </div>
            <span className="text-indigo-400 font-medium">{100 - (data?.newVisitorPercentage || 0)}%</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-600/20 rounded-lg">
                <Eye className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">방문당 페이지뷰</p>
                <p className="text-lg sm:text-xl font-bold text-white">
                  {data?.totalVisitors ? (data.totalPageViews / data.totalVisitors).toFixed(1) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 일별 방문자 추이 */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4">일별 방문자 추이</h2>
          {data?.dailyVisitors?.length ? (
            <div className="space-y-3">
              {data.dailyVisitors.map((day) => (
                <div key={day.date} className="flex items-center gap-2 sm:gap-4">
                  <span className="text-gray-400 text-xs sm:text-sm w-10 sm:w-12 shrink-0">{day.date}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-5 sm:h-6 bg-gray-700 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(day.visitors / maxVisitors) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 sm:w-20 text-right">
                      <span className="text-white text-xs sm:text-sm">{day.visitors}</span>
                      <span className="text-gray-500 text-xs ml-1">({day.pageViews})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-500">
              데이터가 없습니다
            </div>
          )}
          <p className="text-gray-500 text-xs mt-3">방문자 (페이지뷰)</p>
        </div>

        {/* 시간대별 트래픽 */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4">시간대별 트래픽</h2>
          {data?.hourlyStats?.length ? (
            <div className="flex items-end gap-0.5 sm:gap-1 h-32 sm:h-40">
              {data.hourlyStats.map((count, hour) => (
                <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-400"
                    style={{
                      height: `${(count / maxHourly) * 100}%`,
                      minHeight: count > 0 ? '4px' : '0px'
                    }}
                    title={`${hour}시: ${count}건`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-500">
              데이터가 없습니다
            </div>
          )}
          <div className="flex justify-between mt-2 text-gray-500 text-xs">
            <span>0시</span>
            <span>6시</span>
            <span>12시</span>
            <span>18시</span>
            <span>24시</span>
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 유입 경로 */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4">유입 경로</h2>
          {data?.trafficSources?.length ? (
            <div className="space-y-4">
              {data.trafficSources.map((source) => (
                <div key={source.source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{source.source}</span>
                    <span className="text-white font-medium text-sm">{source.visitors.toLocaleString()}명 ({source.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${source.color} rounded-full transition-all`}
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-500">
              데이터가 없습니다
            </div>
          )}
        </div>

        {/* 디바이스 */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4">디바이스</h2>
          {data?.deviceStats?.length ? (
            <div className="space-y-5">
              {data.deviceStats.map((device) => {
                const Icon = deviceIcons[device.device] || Monitor
                const colorClass = deviceColors[device.device] || 'text-gray-400'
                return (
                  <div key={device.device} className="flex items-center gap-3 sm:gap-4">
                    <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${colorClass}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300 text-sm">{device.device}</span>
                        <div className="text-right">
                          <span className="text-white font-medium text-sm">{device.percentage}%</span>
                          <span className="text-gray-500 text-xs ml-2">({device.count.toLocaleString()})</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${device.percentage}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-500">
              데이터가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* 인기 페이지 */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-4">인기 페이지 TOP 10</h2>
        {data?.topPages?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-xs sm:text-sm border-b border-gray-700">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">페이지</th>
                  <th className="pb-3 font-medium text-right">조회수</th>
                  <th className="pb-3 font-medium text-right hidden sm:table-cell">비율</th>
                  <th className="pb-3 font-medium text-right hidden sm:table-cell">평균 체류</th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.map((page, index) => (
                  <tr key={page.path} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 text-gray-500 text-sm">{index + 1}</td>
                    <td className="py-3">
                      <div>
                        <p className="text-white text-sm">{page.title}</p>
                        <p className="text-gray-500 text-xs truncate max-w-[150px] sm:max-w-none">{page.path}</p>
                      </div>
                    </td>
                    <td className="py-3 text-right text-white font-medium text-sm">{page.views.toLocaleString()}</td>
                    <td className="py-3 text-right hidden sm:table-cell">
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                        {page.percentage}%
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-300 text-sm hidden sm:table-cell">{formatDuration(page.avgDuration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-gray-500">
            데이터가 없습니다
          </div>
        )}
      </div>

      {/* Info Notice */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-blue-400 font-medium text-sm">실시간 분석</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              30초마다 자동 새로고침됩니다. 방문자가 사이트를 이용할 때마다 데이터가 자동으로 수집됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
