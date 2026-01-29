'use client'

import { useState } from 'react'
import {
  BarChart3,
  Users,
  Eye,
  Clock,
  MousePointer,
  Smartphone,
  Monitor,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react'

// 샘플 분석 데이터
const dailyVisitors = [
  { date: '1/23', visitors: 145, pageViews: 423 },
  { date: '1/24', visitors: 167, pageViews: 512 },
  { date: '1/25', visitors: 132, pageViews: 389 },
  { date: '1/26', visitors: 189, pageViews: 567 },
  { date: '1/27', visitors: 201, pageViews: 623 },
  { date: '1/28', visitors: 178, pageViews: 534 },
  { date: '1/29', visitors: 156, pageViews: 478 },
]

const topPages = [
  { path: '/', title: '홈페이지', views: 1234, percentage: 32 },
  { path: '/free', title: '자유게시판', views: 856, percentage: 22 },
  { path: '/it-ai', title: 'IT&AI', views: 623, percentage: 16 },
  { path: '/login', title: '로그인', views: 445, percentage: 11 },
  { path: '/admin', title: '관리자', views: 312, percentage: 8 },
]

const trafficSources = [
  { source: '직접 방문', visitors: 456, percentage: 38, color: 'bg-blue-500' },
  { source: 'Google 검색', visitors: 312, percentage: 26, color: 'bg-green-500' },
  { source: 'Naver 검색', visitors: 234, percentage: 19, color: 'bg-yellow-500' },
  { source: 'SNS (Instagram)', visitors: 123, percentage: 10, color: 'bg-pink-500' },
  { source: '기타', visitors: 87, percentage: 7, color: 'bg-gray-500' },
]

const deviceStats = [
  { device: 'Mobile', icon: Smartphone, percentage: 62, color: 'text-blue-400' },
  { device: 'Desktop', icon: Monitor, percentage: 35, color: 'text-green-400' },
  { device: 'Tablet', icon: Monitor, percentage: 3, color: 'text-purple-400' },
]

const countryStats = [
  { country: '대한민국', flag: '🇰🇷', visitors: 892, percentage: 74 },
  { country: '미국', flag: '🇺🇸', visitors: 156, percentage: 13 },
  { country: '일본', flag: '🇯🇵', visitors: 89, percentage: 7 },
  { country: '기타', flag: '🌍', visitors: 75, percentage: 6 },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const totalVisitors = dailyVisitors.reduce((sum, d) => sum + d.visitors, 0)
  const totalPageViews = dailyVisitors.reduce((sum, d) => sum + d.pageViews, 0)
  const avgSessionDuration = '2분 34초'
  const bounceRate = 42

  const maxVisitors = Math.max(...dailyVisitors.map((d) => d.visitors))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-500" />
            방문자 분석
          </h1>
          <p className="text-gray-400 mt-1">reve-community 트래픽 현황</p>
        </div>
        <div className="flex items-center gap-3">
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
            className="p-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">총 방문자</p>
              <p className="text-2xl font-bold text-white mt-1">{totalVisitors.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-green-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5%</span>
            <span className="text-gray-500">전주 대비</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">페이지뷰</p>
              <p className="text-2xl font-bold text-white mt-1">{totalPageViews.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-600 rounded-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-green-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+8.3%</span>
            <span className="text-gray-500">전주 대비</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">평균 체류시간</p>
              <p className="text-2xl font-bold text-white mt-1">{avgSessionDuration}</p>
            </div>
            <div className="p-3 bg-green-600 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-green-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+5.2%</span>
            <span className="text-gray-500">전주 대비</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">이탈률</p>
              <p className="text-2xl font-bold text-white mt-1">{bounceRate}%</p>
            </div>
            <div className="p-3 bg-orange-600 rounded-lg">
              <MousePointer className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-red-400 text-sm">
            <TrendingDown className="w-4 h-4" />
            <span>-2.1%</span>
            <span className="text-gray-500">전주 대비</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">일별 방문자 추이</h2>
          <div className="space-y-4">
            {dailyVisitors.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <span className="text-gray-400 text-sm w-12">{day.date}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-6 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(day.visitors / maxVisitors) * 100}%` }}
                    />
                  </div>
                  <span className="text-white text-sm w-12 text-right">{day.visitors}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">유입 경로</h2>
          <div className="space-y-4">
            {trafficSources.map((source) => (
              <div key={source.source} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">{source.source}</span>
                  <span className="text-white font-medium">{source.visitors}명 ({source.percentage}%)</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${source.color} rounded-full`}
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">인기 페이지</h2>
          <div className="space-y-3">
            {topPages.map((page, index) => (
              <div key={page.path} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 font-medium">{index + 1}</span>
                  <div>
                    <p className="text-white text-sm">{page.title}</p>
                    <p className="text-gray-500 text-xs">{page.path}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">{page.views.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">{page.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">디바이스</h2>
          <div className="space-y-6">
            {deviceStats.map((device) => (
              <div key={device.device} className="flex items-center gap-4">
                <device.icon className={`w-8 h-8 ${device.color}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300">{device.device}</span>
                    <span className="text-white font-medium">{device.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${device.percentage}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">국가별 방문자</h2>
          <div className="space-y-3">
            {countryStats.map((country) => (
              <div key={country.country} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{country.flag}</span>
                  <span className="text-gray-300">{country.country}</span>
                </div>
                <div className="text-right">
                  <p className="text-white">{country.visitors.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">{country.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vercel Analytics Status */}
      <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h3 className="text-green-400 font-medium">Vercel Analytics 연동 가능</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          실제 방문자 데이터를 추적하려면 Vercel Analytics를 활성화하세요.
        </p>
        <div className="flex gap-3">
          <a
            href="https://vercel.com/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm"
          >
            Vercel Analytics 설정
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Sample Data Notice */}
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
        <p className="text-yellow-400 text-sm">
          위 차트는 샘플 데이터입니다. Vercel Analytics 연동 후 실제 데이터로 대체됩니다.
        </p>
      </div>
    </div>
  )
}
