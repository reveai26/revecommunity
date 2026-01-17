'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ThemeToggle } from './theme-toggle'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    name: '소개',
    path: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: '자유',
    path: '/free',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    name: 'IT&AI',
    path: '/it-ai',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
]

interface UserProfile {
  id: string
  display_name: string
  avatar_url: string | null
  subscription_tier: string
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setProfile(data.profile)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setProfile(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <aside
      className={cn(
        'hidden md:flex fixed left-0 top-0 h-screen bg-surface border-r border-border transition-all duration-300 flex-col',
        isExpanded ? 'w-60' : 'w-16'
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-border">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
          R
        </div>
        {isExpanded && (
          <span className="ml-3 font-bold text-lg whitespace-nowrap">REVE</span>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    'flex items-center px-3 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {isExpanded && (
                    <span className="ml-3 whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border p-2 space-y-2">
        {/* Theme Toggle */}
        <div className={cn('flex items-center', !isExpanded && 'justify-center')}>
          <ThemeToggle />
          {isExpanded && <span className="ml-3 text-sm text-text-secondary">테마</span>}
        </div>

        {/* Profile / Login */}
        {!loading && (
          <>
            {profile ? (
              <div className="space-y-2">
                <div className="flex items-center px-3 py-3 rounded-lg bg-surface-hover">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      className="w-5 h-5 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs flex-shrink-0">
                      {profile.display_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  {isExpanded && (
                    <span className="ml-3 text-sm whitespace-nowrap truncate">
                      {profile.display_name}
                    </span>
                  )}
                </div>
                {isExpanded && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-text-secondary text-sm"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="ml-3">로그아웃</span>
                  </button>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center px-3 py-3 rounded-lg hover:bg-surface-hover transition-colors text-text-secondary"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {isExpanded && <span className="ml-3 whitespace-nowrap">로그인</span>}
              </Link>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
