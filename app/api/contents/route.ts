import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// GET: 콘텐츠 목록 조회
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') // 'blog' or 'youtube'
  const tier = searchParams.get('tier') // 'free', 'basic', 'pro', 'max'

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  let query = supabase
    .from('contents')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (type) {
    query = query.eq('content_type', type)
  }

  if (tier) {
    query = query.eq('access_tier', tier)
  }

  const { data: contents, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ contents })
}

// POST: 콘텐츠 발행 (관리자만)
export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users_profile')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const body = await request.json()
  const {
    slug,
    title,
    description,
    content_type,
    body: contentBody,
    youtube_url,
    thumbnail_url,
    access_tier = 'free',
    is_published = true,
  } = body

  const { data: content, error } = await supabase
    .from('contents')
    .insert({
      slug,
      title,
      description,
      content_type,
      body: contentBody,
      youtube_url,
      youtube_id: youtube_url ? extractYoutubeId(youtube_url) : null,
      thumbnail_url,
      access_tier,
      is_published,
      published_at: is_published ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ content }, { status: 201 })
}

function extractYoutubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}
