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
  const router = useRouter()
  const pathname = usePathname()

  const isSyncingRef = React.useRef(false)

  // Initialize and listen to auth state changes
  React.useEffect(() => {
    let mounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log(`[AuthProvider] Auth Event: ${event}`, session?.user?.email)

      // Handle login, token refresh, or initial session events
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (session && !isSyncingRef.current) {
          isSyncingRef.current = true
          console.log(`[AuthProvider] Starting inventory sync for ${event}...`)
          try {
            await syncInventory()
          } catch (error) {
            console.error(`[AuthProvider] Inventory sync failed for ${event}:`, error)
          } finally {
            isSyncingRef.current = false
            console.log(`[AuthProvider] Inventory sync finished for ${event}`)
          }
        }
      }

      // Handle logout
      if (event === 'SIGNED_OUT') {
        clearInventory()
        // If we are on a protected route, the middleware or layout should handle redirection,
        // but we can also trigger a refresh here.
        if (pathname !== '/login' && pathname !== '/signup' && pathname !== '/') {
          router.refresh()
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
