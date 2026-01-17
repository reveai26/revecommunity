export default function ItAiPage() {
  const contents = [
    {
      id: 1,
      type: 'blog' as const,
      title: 'Next.js 14 App Router 완벽 가이드',
      thumbnail: null,
      tier: 'free' as const,
      date: '2024.01.15',
      views: 1234,
    },
    {
      id: 2,
      type: 'youtube' as const,
      title: 'AI 개발자가 되기 위한 로드맵',
      thumbnail: null,
      tier: 'pro' as const,
      date: '2024.01.14',
      views: 2456,
    },
    {
      id: 3,
      type: 'blog' as const,
      title: 'TypeScript 고급 타입 시스템',
      thumbnail: null,
      tier: 'basic' as const,
      date: '2024.01.13',
      views: 987,
    },
  ]

  const tierLabels = {
    free: '무료',
    basic: '베이직',
    pro: '프로',
    max: '맥스',
  }

  const tierColors = {
    free: 'bg-success/10 text-success',
    basic: 'bg-info/10 text-info',
    pro: 'bg-primary/10 text-primary',
    max: 'bg-warning/10 text-warning',
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">IT & AI 콘텐츠</h1>

        {/* Filter */}
        <div className="flex gap-2">
          <button className="btn-ghost px-4 py-2 text-sm">전체</button>
          <button className="btn-ghost px-4 py-2 text-sm">블로그</button>
          <button className="btn-ghost px-4 py-2 text-sm">영상</button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((content) => (
          <article key={content.id} className="card group cursor-pointer">
            {/* Thumbnail */}
            <div className="aspect-video bg-surface-active rounded-lg mb-4 flex items-center justify-center">
              {content.type === 'youtube' ? (
                <svg className="w-12 h-12 text-error" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
                </svg>
              ) : (
                <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>

            {/* Content Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded ${content.type === 'blog' ? 'bg-info/10 text-info' : 'bg-error/10 text-error'}`}>
                  {content.type === 'blog' ? '블로그' : '영상'}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${tierColors[content.tier]}`}>
                  {tierLabels[content.tier]}
                </span>
              </div>

              <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {content.title}
              </h3>

              <div className="flex items-center gap-3 text-sm text-text-muted">
                <span>{content.date}</span>
                <span>·</span>
                <span>조회 {content.views.toLocaleString()}</span>
              </div>

              {content.tier !== 'free' && (
                <div className="mt-3 flex items-center gap-1 text-sm text-text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>{tierLabels[content.tier]} 회원 전용</span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
