'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'

interface Post {
  id: string
  content: string
  images: string[]
  likes_count: number
  comments_count: number
  created_at: string
  author: {
    id: string
    display_name: string
    avatar_url: string | null
    subscription_tier: string
  }
}

export default function FreePageClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchPosts()
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    setUser(data.user)
  }

  const fetchPosts = async () => {
    const res = await fetch('/api/posts?limit=20')
    const data = await res.json()
    setPosts(data.posts || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert('로그인이 필요합니다')
      window.location.href = '/login'
      return
    }

    if (!newPost.trim()) return

    setLoading(true)

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost }),
      })

      if (res.ok) {
        setNewPost('')
        fetchPosts()
      } else {
        const data = await res.json()
        alert(data.error || '글 작성에 실패했습니다')
      }
    } catch (error) {
      console.error(error)
      alert('글 작성 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) {
      alert('로그인이 필요합니다')
      return
    }

    try {
      await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
      fetchPosts()
    } catch (error) {
      console.error(error)
    }
  }

  const tierBadges: Record<string, { label: string; color: string }> = {
    free: { label: '무료', color: 'bg-surface text-text-muted' },
    basic: { label: '베이직', color: 'bg-info/10 text-info' },
    pro: { label: '프로', color: 'bg-primary/10 text-primary' },
    max: { label: '맥스', color: 'bg-warning/10 text-warning' },
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">자유 게시판</h1>

      {/* Post Composer */}
      <div className="card mb-6">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={user ? "무슨 생각을 하고 계신가요?" : "로그인 후 글을 작성할 수 있습니다"}
                className="textarea w-full min-h-[100px] mb-3"
                disabled={loading || !user}
                onClick={() => !user && (window.location.href = '/login')}
              />
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="btn-primary px-6 py-2 text-sm"
                  disabled={loading || !newPost.trim() || !user}
                >
                  {loading ? '게시 중...' : '게시하기'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts.map((post) => {
          const badge = tierBadges[post.author.subscription_tier]
          return (
            <article key={post.id} className="card">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold">
                  {post.author.display_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{post.author.display_name}</span>
                    <span className="text-text-muted text-sm">· {formatDate(post.created_at)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-text-secondary mb-4 whitespace-pre-wrap">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-6 text-text-muted text-sm">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2 hover:text-error transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.likes_count}
                    </button>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.comments_count}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )
        })}

        {posts.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            아직 게시글이 없습니다. 첫 글을 작성해보세요!
          </div>
        )}
      </div>
    </div>
  )
}
