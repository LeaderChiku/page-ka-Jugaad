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

  // Initialize and listen to auth state changes
  React.useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      // Check for initial session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (mounted && session) {
        console.log("Initial session restored for:", session.user.email)
        try {
          await syncInventory()
        } catch (error) {
          console.warn("Initial inventory sync failed - user may need to re-auth for Drive access")
        }
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log(`Auth event: ${event}`, session?.user?.email)

      // Handle login or token refresh events
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          try {
            await syncInventory()
          } catch (error) {
            console.error("Inventory sync failed after auth event:", event, error)
          }
        }
      }

      // Handle logout
      if (event === 'SIGNED_OUT') {
        clearInventory()
        // If we are on a protected route, the middleware or layout should handle redirection,
        // but we can also trigger a refresh here.
        router.refresh()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, syncInventory, clearInventory, router])

  return <>{children}</>
}
