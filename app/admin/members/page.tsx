'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  UserPlus,
  UserCheck,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  MoreHorizontal,
  Download,
  RefreshCw,
  Crown,
} from 'lucide-react'

interface Member {
  id: string
  user_id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  subscription_tier: 'free' | 'basic' | 'pro' | 'max'
  created_at: string
  updated_at: string
}

interface MonthlyStats {
  month: string
  count: number
}

interface TierStats {
  free: number
  basic: number
  pro: number
  max: number
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [tierStats, setTierStats] = useState<TierStats>({ free: 0, basic: 0, pro: 0, max: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const itemsPerPage = 10

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchQuery,
        status: statusFilter,
      })

      const response = await fetch(`/api/admin/members?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch members')
      }

      setMembers(data.members || [])
      setTotalCount(data.totalCount || 0)
      setMonthlyStats(data.monthlyStats || [])
      setTierStats(data.tierStats || { free: 0, basic: 0, pro: 0, max: 0 })
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, statusFilter])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const thisMonthCount = monthlyStats.length > 0 ? monthlyStats[monthlyStats.length - 1].count : 0
  const lastMonthCount = monthlyStats.length > 1 ? monthlyStats[monthlyStats.length - 2].count : 0
  const growthRate = lastMonthCount > 0
    ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
    : thisMonthCount > 0 ? 100 : 0

  const paidMembers = tierStats.basic + tierStats.pro + tierStats.max
  const maxCount = Math.max(...monthlyStats.map((d) => d.count), 1)

  const getTierBadge = (tier: Member['subscription_tier']) => {
    switch (tier) {
      case 'max':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1"><Crown className="w-3 h-3" />MAX</span>
      case 'pro':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">PRO</span>
      case 'basic':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">BASIC</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">FREE</span>
    }
  }

  const getRoleBadge = (role: Member['role']) => {
    if (role === 'admin') {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">관리자</span>
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">회원 관리</h1>
          <p className="text-gray-400 mt-1">reve-community 회원 데이터</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMembers}
            className="p-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            내보내기
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">전체 회원</p>
              <p className="text-2xl font-bold text-white">{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">유료 구독</p>
              <p className="text-2xl font-bold text-white">{paidMembers}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">이번 달 가입</p>
              <p className="text-2xl font-bold text-white">{thisMonthCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${growthRate >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
              {growthRate >= 0 ? (
                <TrendingUp className="w-6 h-6 text-white" />
              ) : (
                <TrendingDown className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <p className="text-gray-400 text-sm">전월 대비</p>
              <p className={`text-2xl font-bold ${growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {growthRate >= 0 ? '+' : ''}{growthRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">월별 가입자 추이</h2>
          {monthlyStats.length > 0 ? (
            <div className="flex items-end gap-4 h-40">
              {monthlyStats.map((data) => (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex justify-center">
                    <div
                      className="w-12 bg-blue-600 rounded-t-lg transition-all hover:bg-blue-500"
                      style={{ height: `${(data.count / maxCount) * 120}px`, minHeight: '4px' }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm">{data.month}</span>
                  <span className="text-white text-sm font-medium">{data.count}명</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-500">
              데이터 로딩 중...
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">구독 티어 분포</h2>
          <div className="space-y-4">
            {[
              { tier: 'MAX', count: tierStats.max, color: 'bg-purple-500' },
              { tier: 'PRO', count: tierStats.pro, color: 'bg-blue-500' },
              { tier: 'BASIC', count: tierStats.basic, color: 'bg-green-500' },
              { tier: 'FREE', count: tierStats.free, color: 'bg-gray-500' },
            ].map((item) => (
              <div key={item.tier} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">{item.tier}</span>
                  <span className="text-white font-medium">
                    {item.count}명 ({totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${totalCount > 0 ? (item.count / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Member List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="이름 또는 이메일로 검색..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 outline-none"
            >
              <option value="all">전체</option>
              <option value="active">유료 구독</option>
              <option value="free">무료</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">회원</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">가입일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">구독 티어</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">역할</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    로딩 중...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    회원이 없습니다
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-750">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {(member.display_name || member.email || '?')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">
                            {member.display_name || '이름 없음'}
                          </p>
                          <p className="text-gray-400 text-sm">{member.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(member.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </td>
                    <td className="px-4 py-4">{getTierBadge(member.subscription_tier)}</td>
                    <td className="px-4 py-4">{getRoleBadge(member.role)}</td>
                    <td className="px-4 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <p className="text-gray-400 text-sm">총 {totalCount}명</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-gray-300 px-4">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
