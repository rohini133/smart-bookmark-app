import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    const errorUrl = new URL('/', requestUrl.origin)
    errorUrl.searchParams.set('error', 'auth_failed')
    return NextResponse.redirect(errorUrl)
  }

  // Prepare redirect URL
  const redirectUrl = new URL(next, requestUrl.origin)
  redirectUrl.searchParams.delete('code')
  redirectUrl.searchParams.delete('next')

  // Create a response object that we'll update as cookies are set
  let response = NextResponse.redirect(redirectUrl)

  if (code) {
    // Create Supabase client with proper cookie handling for redirects
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Update both request and response cookies
            request.cookies.set({
              name,
              value,
              ...options,
            })
            // Recreate response with updated cookies
            response = NextResponse.redirect(redirectUrl)
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            // Update both request and response cookies
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            // Recreate response with updated cookies
            response = NextResponse.redirect(redirectUrl)
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      // Redirect to home with error message
      const errorUrl = new URL('/', requestUrl.origin)
      errorUrl.searchParams.set('error', 'auth_failed')
      return NextResponse.redirect(errorUrl)
    }
    
    // Verify the session was created
    if (!data.session) {
      console.error('Session exchange succeeded but no session found')
      const errorUrl = new URL('/', requestUrl.origin)
      errorUrl.searchParams.set('error', 'auth_failed')
      return NextResponse.redirect(errorUrl)
    }
    
    // Double-check user exists
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('Session exists but no user found')
      const errorUrl = new URL('/', requestUrl.origin)
      errorUrl.searchParams.set('error', 'auth_failed')
      return NextResponse.redirect(errorUrl)
    }
    
    console.log('Successfully authenticated user:', user.email)
  }
  
  // Ensure cookies are set properly
  response.headers.set('Cache-Control', 'no-store, must-revalidate')
  
  return response
}
