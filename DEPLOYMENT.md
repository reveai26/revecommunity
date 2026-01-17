# 레브 커뮤니티 - Vercel 배포 가이드

## 📋 사전 준비사항

- [x] Supabase 프로젝트 생성 완료
- [x] Google OAuth 설정 완료
- [ ] GitHub 계정
- [ ] Vercel 계정 (GitHub 계정으로 로그인 가능)

---

## 🚀 배포 절차

### 1단계: GitHub에 프로젝트 업로드

#### 1-1. GitHub 저장소 생성
1. https://github.com 접속 및 로그인
2. 우측 상단 "+" → "New repository" 클릭
3. Repository 정보 입력:
   - **Repository name**: `reve-community`
   - **Description**: 레브 커뮤니티 - IT&AI 크리에이터 플랫폼
   - **Visibility**: Private (비공개) 선택
   - **Add .gitignore**: 선택 안함 (이미 있음)
4. "Create repository" 클릭

#### 1-2. 로컬에서 GitHub에 푸시

PowerShell에서 다음 명령어 실행:

```powershell
# 프로젝트 디렉토리로 이동
cd D:\vscode\reve-community

# Git 초기화 (이미 완료)
git init

# 모든 파일 스테이징
git add .

# 첫 커밋
git commit -m "Initial commit: 레브 커뮤니티 프로젝트"

# GitHub 저장소와 연결 (YOUR_USERNAME을 본인 GitHub 계정명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/reve-community.git

# main 브랜치로 푸시
git branch -M main
git push -u origin main
```

**GitHub 인증 요청 시:**
- 사용자명: GitHub 계정명
- 비밀번호: Personal Access Token 사용
  - https://github.com/settings/tokens 에서 생성
  - repo 권한 선택

---

### 2단계: Vercel에 배포

#### 2-1. Vercel 계정 생성
1. https://vercel.com 접속
2. "Sign Up" 클릭
3. **"Continue with GitHub"** 선택 (권장)
4. GitHub 계정 인증

#### 2-2. 프로젝트 임포트
1. Vercel 대시보드에서 "Add New..." → "Project" 클릭
2. "Import Git Repository" 섹션에서 `reve-community` 선택
3. "Import" 클릭

#### 2-3. 프로젝트 설정
**Configure Project** 화면에서:

1. **Framework Preset**: Next.js (자동 감지됨)

2. **Root Directory**: `./` (기본값)

3. **Build and Output Settings**:
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)

4. **Environment Variables** (중요!):
   "Add" 버튼을 클릭하여 다음 환경 변수 추가:

   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://gbkyztbhktxrqblccvqe.supabase.co

   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3l6dGJoa3R4cnFibGNjdnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMTM3MTMsImV4cCI6MjA1MjY4OTcxM30.sb_publishable_anEKZxzQdkRGGm-RL3lsYQ_bCbz6-3v
   ```

5. **"Deploy"** 버튼 클릭

#### 2-4. 배포 완료 대기
- 빌드 로그를 실시간으로 확인 가능
- 2-3분 정도 소요
- 성공 시 "Congratulations!" 메시지와 함께 배포 URL 제공
  - 예: `https://reve-community-xxx.vercel.app`

---

### 3단계: Google OAuth 리디렉션 URI 업데이트

Vercel 배포 URL을 받은 후, Google OAuth 설정을 업데이트해야 합니다.

#### 3-1. Google Cloud Console 업데이트
1. https://console.cloud.google.com 접속
2. "API 및 서비스" > "사용자 인증 정보"
3. 생성한 OAuth 클라이언트 ID 클릭
4. **승인된 자바스크립트 원본**에 추가:
   ```
   https://reve-community-xxx.vercel.app
   ```
   (실제 Vercel URL로 변경)

5. **승인된 리디렉션 URI**는 그대로 유지:
   ```
   https://gbkyztbhktxrqblccvqe.supabase.co/auth/v1/callback
   ```

6. "저장" 클릭

#### 3-2. Supabase 사이트 URL 업데이트
1. Supabase 대시보드 > Settings > API
2. **Site URL** 업데이트:
   ```
   https://reve-community-xxx.vercel.app
   ```
3. **Redirect URLs**에 추가:
   ```
   https://reve-community-xxx.vercel.app/**
   ```
4. "Save" 클릭

---

### 4단계: 커스텀 도메인 설정 (선택사항)

#### 4-1. 도메인 구매
- Vercel Domains, Namecheap, GoDaddy 등에서 구매

#### 4-2. Vercel에 도메인 추가
1. Vercel 프로젝트 > Settings > Domains
2. 도메인 입력 (예: `reve-community.com`)
3. DNS 설정 안내에 따라 도메인 레지스트라에서 설정
   - A 레코드 또는 CNAME 레코드 추가
4. SSL 자동 발급 (Let's Encrypt)

#### 4-3. Google OAuth 및 Supabase 업데이트
커스텀 도메인으로 3단계 반복

---

## ✅ 배포 후 체크리스트

### 필수 확인사항
- [ ] 배포 URL 접속 확인
- [ ] 소개 페이지 정상 표시
- [ ] 다크/라이트 테마 전환 작동
- [ ] 모바일 반응형 확인
- [ ] Google 로그인 테스트
- [ ] 자유 게시판 글 작성 테스트
- [ ] IT&AI 콘텐츠 페이지 확인

### 성능 최적화
- [ ] Vercel Analytics 활성화
- [ ] Lighthouse 점수 확인
- [ ] 이미지 최적화 (next/image 사용)

---

## 🔄 업데이트 배포 (자동)

코드 변경 후 GitHub에 푸시하면 **자동으로 Vercel에 배포**됩니다:

```powershell
git add .
git commit -m "업데이트 내용"
git push
```

- main 브랜치 푸시 → Production 배포
- 다른 브랜치 푸시 → Preview 배포

---

## 📊 Vercel 대시보드 주요 기능

### Deployments
- 모든 배포 이력 확인
- 롤백 가능

### Analytics
- 페이지 뷰, 방문자 통계
- 성능 지표

### Logs
- 실시간 서버 로그
- 에러 추적

### Settings
- Environment Variables (환경 변수 관리)
- Domains (도메인 관리)
- Functions (서버리스 함수 설정)

---

## 🐛 문제 해결

### 빌드 실패 시
1. Vercel 대시보드 > Deployments > 실패한 배포 클릭
2. 빌드 로그 확인
3. 로컬에서 `npm run build` 테스트
4. 에러 수정 후 다시 푸시

### 환경 변수 오류
1. Vercel 프로젝트 > Settings > Environment Variables
2. 변수명 및 값 재확인
3. 변경 후 "Redeploy" 필요

### Google 로그인 실패
1. Google Cloud Console에서 승인된 URI 재확인
2. Supabase Site URL 재확인
3. 브라우저 캐시 삭제 후 재시도

---

## 💰 Vercel 요금제

### Hobby (무료)
- **개인 프로젝트용**
- 무제한 배포
- 100 GB 대역폭/월
- 서버리스 함수: 100 GB-시간
- **충분함** ✅

### Pro ($20/월)
- 팀 협업 기능
- 1 TB 대역폭/월
- 고급 분석
- 필요 시 업그레이드

---

## 📝 참고 링크

- Vercel 문서: https://vercel.com/docs
- Next.js 배포 가이드: https://nextjs.org/docs/deployment
- Supabase 배포 가이드: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs

---

## 🎉 배포 완료!

축하합니다! 레브 커뮤니티가 전 세계에 공개되었습니다.

**배포 URL 공유하기:**
- SNS에 공유
- 도메인 연결
- SEO 최적화

**다음 단계:**
- Google Analytics 연동
- 토스페이먼츠 결제 연동
- 콘텐츠 발행
- 커뮤니티 홍보
