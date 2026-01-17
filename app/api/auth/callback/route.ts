import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  console.log('Callback received:', { code: !!code, error, error_description })

  if (error) {
    console.error('OAuth error:', error, error_description)
    return NextResponse.redirect(new URL(`/login?error=${error}`, requestUrl.origin))
  }

  if (!code) {
    console.error('No code provided')
    return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin))
  }

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

  console.log('Exchanging code for session...')
  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

  if (sessionError) {
    console.error('Session exchange error:', sessionError.message, sessionError)
    return NextResponse.redirect(new URL(`/login?error=auth_failed&message=${encodeURIComponent(sessionError.message)}`, requestUrl.origin))
  }

  console.log('Session created successfully')

  // Get the user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Get user error:', userError)
    return NextResponse.redirect(new URL('/login?error=user_not_found', requestUrl.origin))
  }

  console.log('User retrieved:', user.email)

  // Check if user profile exists
  const { data: profile, error: profileError } = await supabase
    .from('users_profile')
    .select('*')
    .eq('user_id', user.id)
    .single()

  console.log('Profile check:', { exists: !!profile, profileError: profileError?.message })

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
      console.error('Profile insert error:', insertError.message, insertError)
    } else {
      console.log('Profile created successfully for:', user.email)
    }
  }

  console.log('Redirecting to home...')
  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
