-- 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS users_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 기본 정보
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,

  -- 역할 및 구독
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'max')),

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- 구독 정보 테이블
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,

  -- 구독 정보
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'pro', 'max')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),

  -- 기간
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- 결제 정보 (토스페이먼츠 연동 시 사용)
  payment_key TEXT,
  order_id TEXT,

  -- 설정
  auto_renew BOOLEAN DEFAULT true,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 자유 게시판 테이블
CREATE TABLE IF NOT EXISTS free_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,

  -- 콘텐츠
  content TEXT NOT NULL,

  -- 첨부 이미지 (JSON 배열)
  images JSONB DEFAULT '[]',

  -- 통계
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,

  -- 상태
  is_deleted BOOLEAN DEFAULT false,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IT&AI 콘텐츠 테이블
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 기본 정보
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- 콘텐츠 유형
  content_type TEXT NOT NULL CHECK (content_type IN ('blog', 'youtube')),

  -- 본문 (블로그형)
  body TEXT,

  -- 유튜브 (영상형)
  youtube_url TEXT,
  youtube_id TEXT,

  -- 이미지
  thumbnail_url TEXT,

  -- 접근 권한
  access_tier TEXT DEFAULT 'free' CHECK (access_tier IN ('free', 'basic', 'pro', 'max')),

  -- 통계
  view_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,

  -- 발행 상태
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 댓글 테이블 (통합)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,

  -- 대상 (다형성)
  target_type TEXT NOT NULL CHECK (target_type IN ('free_post', 'content')),
  target_id UUID NOT NULL,

  -- 대댓글 지원
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- 콘텐츠
  content TEXT NOT NULL,

  -- 통계
  likes_count INT DEFAULT 0,

  -- 상태
  is_deleted BOOLEAN DEFAULT false,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 좋아요 테이블 (통합)
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,

  -- 대상 (다형성)
  target_type TEXT NOT NULL CHECK (target_type IN ('free_post', 'content', 'comment')),
  target_id UUID NOT NULL,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 중복 방지
  UNIQUE(user_id, target_type, target_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_free_posts_author ON free_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_free_posts_created ON free_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contents_slug ON contents(slug);
CREATE INDEX IF NOT EXISTS idx_contents_published ON contents(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_access_tier ON contents(access_tier);

CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);

CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);

-- RPC 함수: 좋아요 수 증가
CREATE OR REPLACE FUNCTION increment_likes_count(post_id UUID, table_name TEXT)
RETURNS void AS $$
BEGIN
  IF table_name = 'free_posts' THEN
    UPDATE free_posts SET likes_count = likes_count + 1 WHERE id = post_id;
  ELSIF table_name = 'contents' THEN
    UPDATE contents SET likes_count = likes_count + 1 WHERE id = post_id;
  ELSIF table_name = 'comments' THEN
    UPDATE comments SET likes_count = likes_count + 1 WHERE id = post_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- RPC 함수: 좋아요 수 감소
CREATE OR REPLACE FUNCTION decrement_likes_count(post_id UUID, table_name TEXT)
RETURNS void AS $$
BEGIN
  IF table_name = 'free_posts' THEN
    UPDATE free_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = post_id;
  ELSIF table_name = 'contents' THEN
    UPDATE contents SET likes_count = GREATEST(0, likes_count - 1) WHERE id = post_id;
  ELSIF table_name = 'comments' THEN
    UPDATE comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = post_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- RPC 함수: 댓글 수 증가
CREATE OR REPLACE FUNCTION increment_comments_count(post_id UUID, table_name TEXT)
RETURNS void AS $$
BEGIN
  IF table_name = 'free_posts' THEN
    UPDATE free_posts SET comments_count = comments_count + 1 WHERE id = post_id;
  ELSIF table_name = 'contents' THEN
    UPDATE contents SET comments_count = comments_count + 1 WHERE id = post_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) 정책
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- users_profile 정책
CREATE POLICY "Public profiles are viewable by everyone"
  ON users_profile FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  USING (auth.uid() = user_id);

-- free_posts 정책
CREATE POLICY "Posts are viewable by everyone"
  ON free_posts FOR SELECT
  USING (NOT is_deleted);

CREATE POLICY "Authenticated users can create posts"
  ON free_posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own posts"
  ON free_posts FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = author_id));

CREATE POLICY "Users can delete own posts"
  ON free_posts FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = author_id));

-- contents 정책
CREATE POLICY "Published contents are viewable by everyone"
  ON contents FOR SELECT
  USING (is_published = true);

CREATE POLICY "Only admins can manage contents"
  ON contents FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE role = 'admin'));

-- comments 정책
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (NOT is_deleted);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = author_id));

-- likes 정책
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage own likes"
  ON likes FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = user_id));
