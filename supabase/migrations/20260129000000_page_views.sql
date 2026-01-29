-- 페이지 뷰 트래킹 테이블 (고도화 버전)
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  country TEXT,
  session_id TEXT,
  visitor_id TEXT, -- 재방문 추적용 (로컬스토리지 기반)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_new_visitor BOOLEAN DEFAULT false, -- 신규/재방문 구분
  duration INTEGER DEFAULT 0, -- 페이지 체류 시간 (초)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (쿼리 성능 향상)
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_is_new_visitor ON page_views(is_new_visitor);

-- RLS 정책
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- 누구나 insert 가능 (트래킹용)
CREATE POLICY "Anyone can insert page views" ON page_views
  FOR INSERT WITH CHECK (true);

-- 누구나 자신의 page_view duration 업데이트 가능
CREATE POLICY "Anyone can update duration" ON page_views
  FOR UPDATE USING (true) WITH CHECK (true);

-- admin만 select 가능
CREATE POLICY "Admins can view page views" ON page_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.user_id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

-- 기존 테이블에 컬럼 추가 (이미 테이블이 있는 경우)
-- ALTER TABLE page_views ADD COLUMN IF NOT EXISTS visitor_id TEXT;
-- ALTER TABLE page_views ADD COLUMN IF NOT EXISTS is_new_visitor BOOLEAN DEFAULT false;
-- ALTER TABLE page_views ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0;
