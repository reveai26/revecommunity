import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// GET: 단일 포스트 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: post, error } = await supabase
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
    .eq('id', params.id)
    .eq('is_deleted', false)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json({ post })
}

// PUT: 포스트 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  // Check if user is the author
  const { data: post } = await supabase
    .from('free_posts')
    .select('author_id')
    .eq('id', params.id)
    .single()

  if (!post || post.author_id !== profile.id) {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
  }

  const body = await request.json()
  const { content, images } = body

  const { data: updatedPost, error } = await supabase
    .from('free_posts')
    .update({
      content,
      images,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
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

  return NextResponse.json({ post: updatedPost })
}

// DELETE: 포스트 삭제 (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users_profile')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: '프로필을 찾을 수 없습니다' }, { status: 404 })
  }

  // Check if user is the author or admin
  const { data: post } = await supabase
    .from('free_posts')
    .select('author_id')
    .eq('id', params.id)
    .single()

  if (!post || (post.author_id !== profile.id && profile.role !== 'admin')) {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
  }

  const { error } = await supabase
    .from('free_posts')
    .update({ is_deleted: true })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
