import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// POST: 좋아요 토글
export async function POST(
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

  // Check if already liked
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', profile.id)
    .eq('target_type', 'free_post')
    .eq('target_id', params.id)
    .single()

  if (existingLike) {
    // Unlike
    await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id)

    // Decrement likes count
    await supabase.rpc('decrement_likes_count', {
      post_id: params.id,
      table_name: 'free_posts'
    })

    return NextResponse.json({ liked: false })
  } else {
    // Like
    await supabase
      .from('likes')
      .insert({
        user_id: profile.id,
        target_type: 'free_post',
        target_id: params.id,
      })

    // Increment likes count
    await supabase.rpc('increment_likes_count', {
      post_id: params.id,
      table_name: 'free_posts'
    })

    return NextResponse.json({ liked: true })
  }
}
