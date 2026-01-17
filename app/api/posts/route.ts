import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// GET: 피드 목록 조회
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: posts, error } = await supabase
    .from('free_posts')
    .select(`
      *,
      author:users_profile!free_posts_author_id_fkey(
        id,
        display_name,
        avatar_url,
        subscription_tier
      )
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ posts })
}

// POST: 새 글 작성
export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users_profile')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: '프로필을 찾을 수 없습니다' }, { status: 404 })
  }

  const body = await request.json()
  const { content, images = [] } = body

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: '내용을 입력해주세요' }, { status: 400 })
  }

  const { data: post, error } = await supabase
    .from('free_posts')
    .insert({
      author_id: profile.id,
      content,
      images,
    })
    .select(`
      *,
      author:users_profile!free_posts_author_id_fkey(
        id,
        display_name,
        avatar_url,
        subscription_tier
      )
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post }, { status: 201 })
}
