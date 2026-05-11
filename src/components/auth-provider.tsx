"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { useStudioStore } from "@/store/useStudioStore"
import { useRouter, usePathname } from "next/navigation"

/**
 * AuthProvider handles global authentication state and session persistence.
 * It listens for Supabase auth events and triggers necessary side effects like
 * syncing Google Drive inventory when a user is logged in.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const syncInventory = useStudioStore((state) => state.syncInventory)
  const clearInventory = useStudioStore((state) => state.clearInventory)
  const setProviderToken = useStudioStore((state) => state.setProviderToken)
  const router = useRouter()
  const pathname = usePathname()

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
          console.log(`[AuthProvider] Session available for ${event}. Saving token and triggering sync...`)
          setProviderToken(session.provider_token ?? null)
          try {
            await syncInventory()
          } catch (error: any) {
            console.error(`[AuthProvider] Global sync failed for ${event}:`, error.message)
          }
        } else {
          console.warn(`[AuthProvider] ${event} received but no session found.`)
          if (event === 'INITIAL_SESSION' && pathname !== '/login' && pathname !== '/signup' && pathname !== '/') {
            console.log('[AuthProvider] Unauthenticated INITIAL_SESSION on protected route. Redirecting...')
            router.push('/login')
          }
        }
      }

      // Handle logout
      if (event === 'SIGNED_OUT') {
        console.log('[AuthProvider] User signed out, clearing inventory...')
        clearInventory()
        
        // Refresh only if on a protected route to clear data from UI
        if (pathname !== '/login' && pathname !== '/signup' && pathname !== '/') {
          console.log('[AuthProvider] Redirecting or refreshing from protected route...')
          router.push('/login')
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, syncInventory, clearInventory, router, pathname])

  return <>{children}</>
}
