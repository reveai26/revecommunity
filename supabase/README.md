# Supabase 데이터베이스 설정

## 마이그레이션 실행 방법

1. Supabase 프로젝트에 로그인
2. SQL Editor 열기
3. `migrations/001_initial_schema.sql` 파일의 내용을 복사하여 실행

또는 Supabase CLI를 사용하여 실행:

```bash
supabase db push
```

## 환경 변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Google OAuth 설정

1. Supabase Dashboard > Authentication > Providers
2. Google 활성화
3. Google Cloud Console에서 OAuth 클라이언트 ID 생성
4. Authorized redirect URIs에 추가:
   - `https://your-project.supabase.co/auth/v1/callback`

## RLS (Row Level Security) 정책

모든 테이블에 RLS가 활성화되어 있습니다:

- **users_profile**: 모든 사용자가 조회 가능, 본인만 수정 가능
- **free_posts**: 모든 사용자가 조회 가능, 작성자만 수정/삭제 가능
- **contents**: 발행된 콘텐츠만 조회 가능, 관리자만 관리 가능
- **comments**: 모든 사용자가 조회 가능, 작성자만 수정 가능
- **likes**: 모든 사용자가 조회 가능, 본인 좋아요만 관리 가능
