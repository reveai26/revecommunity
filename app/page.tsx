export default function IntroPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold">
          R
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">REVE</h1>
        <p className="text-text-secondary text-lg">IT & AI 크리에이터</p>
      </section>

      {/* Community Introduction */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">레브 커뮤니티</h2>
        <div className="space-y-4 text-text-secondary">
          <p>
            레브 커뮤니티는 IT와 AI 기술에 대한 큐레이션 콘텐츠를 제공하는 플랫폼입니다.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>최신 IT & AI 트렌드와 기술 인사이트</li>
            <li>실전 경험을 바탕으로 한 개발 노하우</li>
            <li>회원들과 자유롭게 소통할 수 있는 커뮤니티</li>
          </ul>
        </div>
      </section>

      {/* Subscription Plans */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">구독 플랜</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Basic Plan */}
          <div className="card">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-primary-bg text-primary rounded-full text-sm font-medium">
                베이직
              </span>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold">₩9,900</span>
              <span className="text-text-secondary">/월</span>
            </div>
            <ul className="space-y-2 mb-6 text-text-secondary text-sm">
              <li>✓ 자유 게시판 이용</li>
              <li>✓ 베이직 전용 콘텐츠</li>
              <li>✓ 광고 제거</li>
              <li>✓ 베이직 뱃지</li>
            </ul>
            <button className="btn-secondary w-full">준비 중</button>
          </div>

          {/* Pro Plan */}
          <div className="card border-primary">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-primary text-white rounded-full text-sm font-medium">
                프로
              </span>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold">₩19,900</span>
              <span className="text-text-secondary">/월</span>
            </div>
            <ul className="space-y-2 mb-6 text-text-secondary text-sm">
              <li>✓ 베이직 플랜 모든 혜택</li>
              <li>✓ 프로 전용 콘텐츠</li>
              <li>✓ 프로 뱃지</li>
            </ul>
            <button className="btn-primary w-full">준비 중</button>
          </div>

          {/* Max Plan */}
          <div className="card">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary to-primary-light text-white rounded-full text-sm font-medium">
                맥스
              </span>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold">₩29,900</span>
              <span className="text-text-secondary">/월</span>
            </div>
            <ul className="space-y-2 mb-6 text-text-secondary text-sm">
              <li>✓ 프로 플랜 모든 혜택</li>
              <li>✓ 맥스 전용 콘텐츠</li>
              <li>✓ 1:1 Q&A</li>
              <li>✓ 조기 콘텐츠 접근</li>
              <li>✓ 맥스 뱃지</li>
            </ul>
            <button className="btn-secondary w-full">준비 중</button>
          </div>
        </div>
      </section>
    </div>
  )
}
