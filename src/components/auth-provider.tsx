"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { useStudioStore } from "@/store/useStudioStore"
import { useRouter, usePathname } from "next/navigation"

const PROVIDER_TOKEN_KEY = 'pagekajugaad_provider_token'

/**
 * AuthProvider handles global authentication state and session persistence.
 * It listens for Supabase auth events and triggers necessary side effects like
 * syncing Google Drive inventory when a user is logged in.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createClient(), [])
  const syncInventory = useStudioStore((state) => state.syncInventory)
  const clearInventory = useStudioStore((state) => state.clearInventory)
  const setProviderToken = useStudioStore((state) => state.setProviderToken)
  const router = useRouter()
  const pathname = usePathname()
  const pathnameRef = React.useRef(pathname)

  // Keep pathnameRef in sync so the auth listener can read current path without being in the dep array
  React.useEffect(() => { pathnameRef.current = pathname }, [pathname])

  // Initialize and listen to auth state changes
  React.useEffect(() => {
    let mounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log(`[AuthProvider] Auth Event: ${event}`, session?.user?.email ? `for ${session.user.email}` : '(no session)')

      // Handle login, token refresh, or initial session events
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (session) {
          // Resolve the best available provider token:
          // A: fresh from session (only present immediately after OAuth exchange)
          // B: persisted in user_metadata (bridged from server-side callback)
          // C: persisted in localStorage (survives page refresh)
          let token: string | null = session.provider_token || session.user?.user_metadata?.google_provider_token || null

          if (token) {
            console.log(`[AuthProvider] Resolved provider token for ${event}.`)
            // Persist to localStorage as secondary backup
            localStorage.setItem(PROVIDER_TOKEN_KEY, token)
          } else {
            // Fallback to localStorage if metadata is not yet updated or missing
            const cached = localStorage.getItem(PROVIDER_TOKEN_KEY)
            if (cached) {
              console.log(`[AuthProvider] Using provider token from localStorage fallback (${event}).`)
              token = cached
            } else {
              console.warn(`[AuthProvider] No provider token available for ${event}.`)
            }
          }

          setProviderToken(token)

          if (token) {
            // Yield one microtask so Zustand flushes setProviderToken before syncInventory reads it
            await Promise.resolve()
            console.log(`[AuthProvider] Token ready. Triggering inventory sync...`)
            try {
              await syncInventory()
            } catch (error: any) {
              console.error(`[AuthProvider] Global sync failed for ${event}:`, error.message)
            }
          }
        } else {
          if (event === 'INITIAL_SESSION' && pathnameRef.current !== '/login' && pathnameRef.current !== '/signup' && pathnameRef.current !== '/') {
            console.log('[AuthProvider] Unauthenticated INITIAL_SESSION on protected route. Redirecting...')
            router.push('/login')
          }
        }
      }

      // Handle logout
      if (event === 'SIGNED_OUT') {
        console.log('[AuthProvider] User signed out, clearing inventory and cached token...')
        localStorage.removeItem(PROVIDER_TOKEN_KEY)
        clearInventory()
        
        if (pathnameRef.current !== '/login' && pathnameRef.current !== '/signup' && pathnameRef.current !== '/') {
          router.push('/login')
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, syncInventory, clearInventory, setProviderToken, router])

  return <>{children}</>
}
