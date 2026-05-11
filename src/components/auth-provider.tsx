"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { useStudioStore } from "@/store/useStudioStore"
import { useRouter, usePathname } from "next/navigation"

const PROVIDER_TOKEN_KEY = 'pagekajugaad_provider_token'

/**
 * AuthProvider — INVESTIGATION MODE
 * syncInventory is temporarily disabled. Only token lifecycle is traced.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createClient(), [])
  const syncInventory = useStudioStore((state) => state.syncInventory)
  const clearInventory = useStudioStore((state) => state.clearInventory)
  const setProviderToken = useStudioStore((state) => state.setProviderToken)
  const router = useRouter()
  const pathname = usePathname()
  const pathnameRef = React.useRef(pathname)

  React.useEffect(() => { pathnameRef.current = pathname }, [pathname])

  React.useEffect(() => {
    let mounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // ─── [TOKEN-TRACE] FULL SESSION DUMP ─────────────────────────────
      console.group(`[TOKEN-TRACE] ══ Auth Event: ${event} ══`)
      console.log('[TOKEN-TRACE] Full session object:', session)
      console.log('[TOKEN-TRACE] session?.provider_token:', session?.provider_token)
      console.log('[TOKEN-TRACE] session?.provider_refresh_token:', session?.provider_refresh_token)
      console.log('[TOKEN-TRACE] session top-level keys:', Object.keys(session ?? {}))
      console.log('[TOKEN-TRACE] user?.identities:', session?.user?.identities)
      console.log('[TOKEN-TRACE] user?.app_metadata:', session?.user?.app_metadata)
      console.log('[TOKEN-TRACE] localStorage token BEFORE this event:', localStorage.getItem(PROVIDER_TOKEN_KEY))
      console.groupEnd()
      // ─────────────────────────────────────────────────────────────────

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (session) {
          const sessionToken = session.provider_token ?? null

          if (sessionToken) {
            console.log(`[TOKEN-TRACE] ✅ provider_token EXISTS in session for ${event}.`)
            console.log(`[TOKEN-TRACE] Writing to localStorage with key "${PROVIDER_TOKEN_KEY}"...`)
            localStorage.setItem(PROVIDER_TOKEN_KEY, sessionToken)
            const readBack = localStorage.getItem(PROVIDER_TOKEN_KEY)
            console.log(
              `[TOKEN-TRACE] localStorage write verification: ${readBack
                ? `✅ SUCCESS — "${readBack.substring(0, 30)}..."`
                : '❌ FAILED — getItem returned null'}`
            )
          } else {
            console.warn(`[TOKEN-TRACE] ❌ provider_token is NULL/UNDEFINED in session for ${event}.`)
            const cached = localStorage.getItem(PROVIDER_TOKEN_KEY)
            console.log(
              `[TOKEN-TRACE] localStorage fallback check: ${cached
                ? `✅ Found cached token — "${cached.substring(0, 30)}..."`
                : '❌ EMPTY — nothing in localStorage either'}`
            )
          }

          // ⚠️ INVESTIGATION MODE: syncInventory is DISABLED.
          // We are only tracing the token lifecycle. Do NOT re-enable here.
          console.log('[TOKEN-TRACE] ⏸  syncInventory() SKIPPED — investigation mode active.')

        } else {
          console.warn(`[TOKEN-TRACE] ❌ ${event} fired but session is null.`)
          if (
            event === 'INITIAL_SESSION' &&
            pathnameRef.current !== '/login' &&
            pathnameRef.current !== '/signup' &&
            pathnameRef.current !== '/'
          ) {
            console.log('[AuthProvider] No session on protected route — redirecting to /login')
            router.push('/login')
          }
        }
      }

      if (event === 'SIGNED_OUT') {
        console.log('[TOKEN-TRACE] SIGNED_OUT — removing cached provider token from localStorage.')
        localStorage.removeItem(PROVIDER_TOKEN_KEY)
        clearInventory()
        if (
          pathnameRef.current !== '/login' &&
          pathnameRef.current !== '/signup' &&
          pathnameRef.current !== '/'
        ) {
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
