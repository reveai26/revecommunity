'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error(error)
      alert('로그인 중 오류가 발생했습니다')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
          R
        </div>
        <h1 className="text-2xl font-bold mb-2">레브 커뮤니티</h1>
        <p className="text-text-secondary">로그인하여 커뮤니티에 참여하세요</p>
      </div>

      <div className="card">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? '로그인 중...' : 'Google로 로그인'}
        </button>

        <p className="text-sm text-text-muted text-center mt-6">
          로그인하면 레브 커뮤니티의{' '}
          <a href="#" className="text-primary hover:underline">
            이용약관
          </a>
          과{' '}
          <a href="#" className="text-primary hover:underline">
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  )
}
