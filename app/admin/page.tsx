'use client'

import { Lightbulb, Users, BarChart3, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    newMembersThisMonth: 0,
    proMembers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/members')
        if (res.ok) {
          const data = await res.json()
          setStats({
            totalMembers: data.totalCount || 0,
            newMembersThisMonth: data.monthlyStats?.[data.monthlyStats.length - 1]?.count || 0,
            proMembers: (data.tierStats?.pro || 0) + (data.tierStats?.max || 0),
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const quickActions = [
    {
      name: 'SaaS Spark',
      description: 'Reddit 기반 B2C SaaS 아이디어 발굴',
      href: '/admin/saas-spark',
      icon: Lightbulb,
      color: 'bg-yellow-500',
    },
    {
      name: '회원 관리',
      description: '회원 목록 조회 및 관리',
      href: '/admin/members',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: '방문자 분석',
      description: '트래픽 및 방문자 현황',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">관리자 대시보드</h1>
        <p className="text-gray-400 mt-1">reve-community 현황을 확인하세요</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">전체 회원</p>
              <p className="text-2xl font-bold text-white">
                {loading ? '...' : stats.totalMembers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">이번 달 신규</p>
              <p className="text-2xl font-bold text-white">
                {loading ? '...' : stats.newMembersThisMonth.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 p-3 rounded-lg">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">유료 회원</p>
              <p className="text-2xl font-bold text-white">
                {loading ? '...' : stats.proMembers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all group"
            >
              <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-medium mb-1 flex items-center gap-2">
                {action.name}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-gray-400 text-sm">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
