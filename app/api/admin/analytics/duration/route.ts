import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// POST: 체류 시간 업데이트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page_view_id, duration } = body

    if (!page_view_id || typeof duration !== 'number') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from('page_views')
      .update({ duration })
      .eq('id', page_view_id)

    if (error) {
      console.error('Duration update error:', error)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Duration update error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
