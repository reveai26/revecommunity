import { createServerClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Comments } from '@/components/comments'

interface Content {
  id: string
  slug: string
  title: string
  description: string | null
  content_type: 'blog' | 'youtube'
  body: string | null
  youtube_url: string | null
  youtube_id: string | null
  thumbnail_url: string | null
  access_tier: 'free' | 'basic' | 'pro' | 'max'
  view_count: number
  likes_count: number
  comments_count: number
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export default async function ContentDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createServerClient()

  // Get content
  const { data: content, error } = await supabase
    .from('contents')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (error || !content) {
    notFound()
  }

  const typedContent = content as Content

  // Check access permission
  const { data: { user } } = await supabase.auth.getUser()

  if (typedContent.access_tier !== 'free') {
    if (!user) {
      redirect('/login?redirect=' + encodeURIComponent(`/it-ai/${params.slug}`))
    }

    const { data: profile } = await supabase
      .from('users_profile')
      .select('subscription_tier')
      .eq('user_id', user.id)
      .single()

    const typedProfile = profile as { subscription_tier: 'free' | 'basic' | 'pro' | 'max' } | null

    if (!typedProfile || !canAccessContent(typedProfile.subscription_tier, typedContent.access_tier)) {
      return <AccessDenied tier={typedContent.access_tier} />
    }
  }

  // Increment view count (temporarily disabled due to type issues)
  // TODO: Fix Supabase type inference
  /*
  await supabase
    .from('contents')
    .update({ view_count: typedContent.view_count + 1 })
    .eq('id', typedContent.id)
  */

  const tierLabels: Record<string, string> = {
    free: '무료',
    basic: '베이직',
    pro: '프로',
    max: '맥스',
  }

  const tierColors: Record<string, string> = {
    free: 'bg-success/10 text-success',
    basic: 'bg-info/10 text-info',
    pro: 'bg-primary/10 text-primary',
    max: 'bg-warning/10 text-warning',
  }

  if (typedContent.content_type === 'youtube') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* YouTube Player */}
        <div className="aspect-video rounded-lg overflow-hidden mb-6">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${typedContent.youtube_id}`}
            title={typedContent.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Content Info */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs px-2 py-1 rounded bg-error/10 text-error">
              영상
            </span>
            <span className={`text-xs px-2 py-1 rounded ${tierColors[typedContent.access_tier]}`}>
              {tierLabels[typedContent.access_tier]}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4">{typedContent.title}</h1>

          <div className="flex items-center gap-3 text-sm text-text-muted">
            <span>REVE</span>
            <span>·</span>
            <span>{new Date(typedContent.published_at || '').toLocaleDateString('ko-KR')}</span>
            <span>·</span>
            <span>조회 {typedContent.view_count.toLocaleString()}</span>
          </div>

          {typedContent.description && (
            <p className="mt-6 text-text-secondary">{typedContent.description}</p>
          )}
        </div>

        {/* Comments */}
        <Comments targetType="content" targetId={typedContent.id} />
      </div>
    )
  }

  // Blog type
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Content Info */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs px-2 py-1 rounded bg-info/10 text-info">
            블로그
          </span>
          <span className={`text-xs px-2 py-1 rounded ${tierColors[typedContent.access_tier]}`}>
            {tierLabels[typedContent.access_tier]}
          </span>
        </div>

        <h1 className="text-3xl font-bold mb-4">{typedContent.title}</h1>

        <div className="flex items-center gap-3 text-sm text-text-muted">
          <span>REVE</span>
          <span>·</span>
          <span>{new Date(typedContent.published_at || '').toLocaleDateString('ko-KR')}</span>
          <span>·</span>
          <span>조회 {typedContent.view_count.toLocaleString()}</span>
        </div>
      </div>

      {/* Thumbnail */}
      {typedContent.thumbnail_url && (
        <div className="mb-8">
          <img
            src={typedContent.thumbnail_url}
            alt={typedContent.title}
            className="w-full rounded-lg"
          />
        </div>
      )}

      {/* Markdown Content */}
      <article className="prose prose-invert max-w-none mb-12">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
          }}
        >
          {typedContent.body || ''}
        </ReactMarkdown>
      </article>

      {/* Comments */}
      <Comments targetType="content" targetId={typedContent.id} />
    </div>
  )
}

function AccessDenied({ tier }: { tier: string }) {
  const tierLabels: Record<string, string> = {
    basic: '베이직',
    pro: '프로',
    max: '맥스',
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold mb-4">{tierLabels[tier]} 회원 전용 콘텐츠입니다</h1>
        <p className="text-text-secondary mb-8">
          이 콘텐츠를 보시려면 {tierLabels[tier]} 이상의 구독이 필요합니다
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/" className="btn-primary">
            {tierLabels[tier]} 구독하기
          </a>
          <a href="/it-ai" className="btn-secondary">
            다른 콘텐츠 보기
          </a>
        </div>
      </div>
    </div>
  )
}

function canAccessContent(userTier: string, contentTier: string): boolean {
  const tierLevels: Record<string, number> = {
    free: 0,
    basic: 1,
    pro: 2,
    max: 3,
  }

  return tierLevels[userTier] >= tierLevels[contentTier]
}
