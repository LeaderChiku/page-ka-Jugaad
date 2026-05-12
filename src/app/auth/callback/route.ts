import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[Auth Callback] Exchange error:', error.message)
    }

    if (!error && data.session) {
      const { provider_token, provider_refresh_token } = data.session
      
      console.log('[Auth Callback] Session established.', { 
        hasProviderToken: !!provider_token, 
        hasProviderRefreshToken: !!provider_refresh_token,
        user: data.session.user.email 
      })

      // Persist provider tokens to user_metadata so they are available in the session 
      // after redirect and refresh (since Supabase doesn't store them in cookies by default)
      if (provider_token) {
        console.log('[Auth Callback] Persisting provider tokens to user_metadata...')
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            google_provider_token: provider_token,
            google_refresh_token: provider_refresh_token
          }
        })
        if (updateError) {
          console.error('[Auth Callback] Failed to update user metadata:', updateError.message)
        } else {
          console.log('[Auth Callback] User metadata updated successfully.')
        }
      } else {
        console.warn('[Auth Callback] No provider_token received in exchange!')
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could+not+authenticate+with+Google`)
}
