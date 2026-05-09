"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export function SiteHeader() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClient();
  const pathname = usePathname();

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Hide header on auth pages if needed, but the requirement says "improve authentication navigation flow"
  // Usually landing page has it. Let's keep it.

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-all">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-8">
            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg leading-none">P</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white hidden sm:inline-block">
                PageKaJugaad
              </span>
            </Link>
            <div className="hidden md:flex">
              <MainNav />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            
            {!loading && (
              <>
                {user ? (
                  <Link href="/dashboard">
                    <Button 
                      variant="ghost" 
                      className="rounded-full px-4 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button 
                      className="rounded-full px-6 text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm"
                    >
                      Login
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
