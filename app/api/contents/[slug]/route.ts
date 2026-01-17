import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// GET: 콘텐츠 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: content, error } = await supabase
    .from('contents')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (error) {
    return NextResponse.json({ error: '콘텐츠를 찾을 수 없습니다' }, { status: 404 })
  }

  // Check access permission
  const { data: { user } } = await supabase.auth.getUser()

  if (content.access_tier !== 'free') {
    if (!user) {
      return NextResponse.json({
        error: '로그인이 필요합니다',
        requiredTier: content.access_tier
      }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users_profile')
      .select('subscription_tier')
      .eq('user_id', user.id)
      .single()

    if (!profile || !canAccessContent(profile.subscription_tier, content.access_tier)) {
      return NextResponse.json({
        error: '구독 등급이 필요합니다',
        requiredTier: content.access_tier
      }, { status: 403 })
    }
  }

  // Increment view count
  await supabase
    .from('contents')
    .update({ view_count: content.view_count + 1 })
    .eq('id', content.id)

  return NextResponse.json({ content })
}

// PUT: 콘텐츠 수정 (관리자만)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users_profile')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const body = await request.json()
  const { data: content, error } = await supabase
    .from('contents')
    .update({
      ...body,
      youtube_id: body.youtube_url ? extractYoutubeId(body.youtube_url) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', params.slug)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ content })
}

// DELETE: 콘텐츠 삭제 (관리자만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users_profile')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const { error } = await supabase
    .from('contents')
    .delete()
    .eq('slug', params.slug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
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

function extractYoutubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}
