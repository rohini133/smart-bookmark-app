import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
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

  // Redirect to home page, removing the code parameter
  const redirectUrl = new URL(next, requestUrl.origin)
  redirectUrl.searchParams.delete('code')
  redirectUrl.searchParams.delete('next')
  
  // Create response with redirect
  const response = NextResponse.redirect(redirectUrl)
  
  // Ensure cookies are set properly
  response.headers.set('Cache-Control', 'no-store, must-revalidate')
  
  return response
}
