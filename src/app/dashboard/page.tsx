import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, LayoutDashboard, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { QuickActions } from '@/components/quick-actions'
import { RecentProjects } from '@/components/recent-projects'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fallback to email prefix if no name exists
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="font-bold text-xl tracking-tight dark:text-white">PageKaJugaad</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg transition-colors">
            <LayoutDashboard className="h-5 w-5 text-indigo-500" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors">
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-700" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50">
                <User className="h-5 w-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <form action="/auth/signout" method="post" className="mt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl flex items-center justify-between px-6 md:hidden">
           <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="font-bold text-xl tracking-tight dark:text-white">PageKaJugaad</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="p-2 text-zinc-500 hover:text-red-600 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome back, {displayName}!</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Here's what's happening with your layouts.
              </p>
            </div>
            <QuickActions />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <RecentProjects />
              <Card>
                <CardHeader>
                  <CardTitle>Recent Exports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Export 1</p>
                        <p className="text-sm text-muted-foreground">Exported on 2023-10-27</p>
                      </div>
                      <p className="text-sm text-muted-foreground">PDF</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Export 2</p>
                        <p className="text-sm text-muted-foreground">Exported on 2023-10-26</p>
                      </div>
                      <p className="text-sm text-muted-foreground">PDF</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[n                { title: 'Total Layouts', value: '0', color: 'from-indigo-500/20 to-blue-500/20', text: 'text-indigo-600 dark:text-indigo-400' },
                { title: 'Assets Uploaded', value: '0', color: 'from-rose-500/20 to-orange-500/20', text: 'text-rose-600 dark:text-rose-400' },
                { title: 'Storage Used', value: '0 MB', color: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
              ].map((stat, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                  <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${stat.color} blur-2xl opacity-50`}></div>
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.title}</h3>
                  <div className={`mt-2 text-3xl font-bold ${stat.text}`}>{stat.value}</div>
                </div>
              ))}
            </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
