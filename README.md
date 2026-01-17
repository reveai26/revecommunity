# 레브 커뮤니티 (REVE Community)

크리에이터 큐레이션형 커뮤니티 플랫폼

## 프로젝트 개요

레브 커뮤니티는 IT&AI 크리에이터 '레브(REVE)'가 운영하는 커뮤니티 플랫폼입니다.
크리에이터의 큐레이션 콘텐츠와 회원들의 자유로운 소통 공간을 제공합니다.

## 기술 스택

- **Frontend**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth)
- **Font**: Pretendard
- **Markdown**: react-markdown, react-syntax-highlighter
- **Payment**: 토스페이먼츠 MCP (추후 연동 예정)

## 주요 기능

### 1. 인증 시스템
- ✅ Google OAuth 소셜 로그인
- ✅ Supabase Auth 기반 세션 관리
- ✅ 자동 프로필 생성

### 2. 소개 페이지
- ✅ 크리에이터 및 커뮤니티 소개
- ✅ 구독 플랜 안내 (베이직/프로/맥스)

### 3. 자유 게시판
- ✅ Twitter/Threads 스타일 피드
- ✅ 글 작성, 수정, 삭제 (CRUD)
- ✅ 좋아요 기능
- ✅ 실시간 피드 업데이트
- ✅ 회원 등급 배지 표시

### 4. IT&AI 콘텐츠
- ✅ 블로그형 콘텐츠 (Markdown 렌더링)
- ✅ 유튜브형 콘텐츠 (YouTube iframe 임베드)
- ✅ 구독 등급별 접근 제어
- ✅ 조회수 추적
- ✅ 잠금 콘텐츠 UI

### 5. 댓글 시스템
- ✅ 통합 댓글 시스템 (자유 게시판 + IT&AI 콘텐츠)
- ✅ 댓글 작성 및 조회
- ✅ 작성자 정보 표시

### 6. 권한 관리
- ✅ Row Level Security (RLS) 정책
- ✅ 구독 등급별 콘텐츠 접근 제어
- ✅ 관리자 전용 기능

### 7. UI/UX
- ✅ 다크/라이트 테마 전환
- ✅ 반응형 디자인 (데스크톱/모바일)
- ✅ 사이드바 네비게이션 (호버 확장)
- ✅ 모바일 하단 탭 네비게이션

## 시작하기

### 1. 의존성 설치

```bash
cd reve-community
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase 데이터베이스 설정

1. Supabase 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 실행
3. Authentication > Providers에서 Google OAuth 활성화

자세한 내용은 [supabase/README.md](supabase/README.md) 참조

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## API 엔드포인트

### 인증
- `POST /api/auth/login` - Google OAuth 로그인
- `GET /api/auth/callback` - OAuth 콜백
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 자유 게시판
- `GET /api/posts` - 피드 목록
- `POST /api/posts` - 글 작성
- `PUT /api/posts/:id` - 글 수정
- `DELETE /api/posts/:id` - 글 삭제
- `POST /api/posts/:id/like` - 좋아요 토글

### IT&AI 콘텐츠
- `GET /api/contents` - 콘텐츠 목록
- `GET /api/contents/:slug` - 콘텐츠 상세
- `POST /api/contents` - 콘텐츠 발행 (관리자)

### 댓글
- `GET /api/comments` - 댓글 목록
- `POST /api/comments` - 댓글 작성

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.
