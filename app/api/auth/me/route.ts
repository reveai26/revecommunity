import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ user: null, profile: null })
  }

  const { data: profile } = await supabase
    .from('users_profile')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ user, profile })
}
