'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  created_at: string
  author: {
    id: string
    display_name: string
    avatar_url: string | null
    subscription_tier: string
  }
}

export function Comments({
  targetType,
  targetId,
}: {
  targetType: 'free_post' | 'content'
  targetId: string
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchComments()
    fetchUser()
  }, [targetId])

  const fetchUser = async () => {
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    setUser(data.user)
  }

  const fetchComments = async () => {
    const res = await fetch(
      `/api/comments?target_type=${targetType}&target_id=${targetId}`
    )
    const data = await res.json()
    setComments(data.comments || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert('로그인이 필요합니다')
      return
    }

    if (!newComment.trim()) return

    setLoading(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          content: newComment,
        }),
      })

      if (res.ok) {
        setNewComment('')
        fetchComments()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const tierBadges: Record<string, { label: string; color: string }> = {
    free: { label: '무료', color: 'bg-surface text-text-muted' },
    basic: { label: '베이직', color: 'bg-info/10 text-info' },
    pro: { label: '프로', color: 'bg-primary/10 text-primary' },
    max: { label: '맥스', color: 'bg-warning/10 text-warning' },
  }

  return (
    <div className="border-t border-border pt-8">
      <h2 className="text-xl font-bold mb-6">
        댓글 {comments.length > 0 && `(${comments.length})`}
      </h2>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 작성해주세요"
            className="textarea w-full min-h-[100px] mb-3"
            disabled={loading}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !newComment.trim()}
            >
              {loading ? '작성 중...' : '댓글 작성'}
            </button>
          </div>
        </form>
      ) : (
        <div className="card mb-8 text-center py-8">
          <p className="text-text-secondary mb-4">댓글을 작성하려면 로그인이 필요합니다</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="btn-primary"
          >
            Google로 로그인하기
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => {
          const badge = tierBadges[comment.author.subscription_tier]
          return (
            <div key={comment.id} className="card">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold">
                  {comment.author.display_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{comment.author.display_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-text-muted text-sm">
                      · {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-text-secondary whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        {comments.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
          </div>
        )}
      </div>
    </div>
  )
}
