import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    await supabase.auth.exchangeCodeForSession(code)

    // Get the user
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check if user profile exists
      const { data: profile } = await supabase
        .from('users_profile')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Create profile if it doesn't exist
      if (!profile) {
        await supabase
          .from('users_profile')
          .insert({
            user_id: user.id,
            email: user.email,
            display_name: user.user_metadata.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata.avatar_url,
          })
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
