import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('Session exchange error:', sessionError)
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }

    // Get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Get user error:', userError)
      return NextResponse.redirect(new URL('/login?error=user_not_found', requestUrl.origin))
    }

    // Check if user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('*')
      .eq('user_id', user.id)
      .single()

    console.log('Profile check:', { profile, profileError })

    // Create profile if it doesn't exist
    if (!profile) {
      const { error: insertError } = await supabase
        .from('users_profile')
        .insert({
          user_id: user.id,
          email: user.email,
          display_name: user.user_metadata.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata.avatar_url,
        })

      if (insertError) {
        console.error('Profile insert error:', insertError)
      } else {
        console.log('Profile created successfully')
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
