'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

// 세션 ID 생성 (브라우저 세션 동안 유지)
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// 방문자 ID 생성 (로컬스토리지 - 재방문 추적)
function getVisitorId(): string {
  if (typeof window === 'undefined') return ''

  let visitorId = localStorage.getItem('analytics_visitor_id')
  if (!visitorId) {
    visitorId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('analytics_visitor_id', visitorId)
  }
  return visitorId
}

// 첫 방문 여부 확인
function isFirstVisit(): boolean {
  if (typeof window === 'undefined') return true
  const hasVisited = localStorage.getItem('analytics_has_visited')
  if (!hasVisited) {
    localStorage.setItem('analytics_has_visited', 'true')
    return true
  }
  return false
}

export default function PageViewTracker() {
  const pathname = usePathname()
  const lastTrackedPath = useRef<string | null>(null)
  const pageEntryTime = useRef<number>(Date.now())
  const currentPageViewId = useRef<string | null>(null)

  // 체류 시간 전송
  const sendDuration = useCallback(async () => {
    if (!currentPageViewId.current) return

    const duration = Math.round((Date.now() - pageEntryTime.current) / 1000)
    if (duration < 1) return // 1초 미만은 무시

    try {
      await fetch('/api/admin/analytics/duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_view_id: currentPageViewId.current,
          duration,
        }),
        keepalive: true, // 페이지 이탈 시에도 전송 보장
      })
    } catch {
      // 무시
    }
  }, [])

  useEffect(() => {
    // 페이지 이탈 시 체류 시간 전송
    const handleBeforeUnload = () => {
      sendDuration()
    }

    // visibility change 시 (탭 전환 등)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendDuration()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [sendDuration])

  useEffect(() => {
    // 이전 페이지 체류 시간 전송
    if (lastTrackedPath.current && lastTrackedPath.current !== pathname) {
      sendDuration()
    }

    // 같은 경로는 중복 트래킹 방지
    if (lastTrackedPath.current === pathname) return
    lastTrackedPath.current = pathname
    pageEntryTime.current = Date.now()

    const trackPageView = async () => {
      try {
        const response = await fetch('/api/admin/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            page_title: document.title,
            referrer: document.referrer || null,
            session_id: getSessionId(),
            visitor_id: getVisitorId(),
            is_new_visitor: isFirstVisit(),
          }),
        })
        const data = await response.json()
        if (data.id) {
          currentPageViewId.current = data.id
        }
      } catch (error) {
        console.debug('Page view tracking failed:', error)
      }
    }

    const timer = setTimeout(trackPageView, 100)
    return () => clearTimeout(timer)
  }, [pathname, sendDuration])

  return null
}
