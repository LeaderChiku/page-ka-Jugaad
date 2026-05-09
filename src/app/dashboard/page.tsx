import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, LayoutDashboard, Settings, User, FileImage } from 'lucide-react'
import Link from 'next/link'
import { QuickActions } from '@/components/quick-actions'
import { RecentProjects } from '@/components/recent-projects'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from '@/components/site-header'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <div className="h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col overflow-hidden">
      <SiteHeader />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden md:flex flex-col z-10">
          <nav className="flex-1 px-4 py-4 space-y-1">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 opacity-50">Menu</p>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg transition-colors">
              <LayoutDashboard className="h-4 w-4 text-indigo-500" />
              <span className="font-medium text-sm">Dashboard</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors">
              <Settings className="h-4 w-4" />
              <span className="font-medium text-sm">Settings</span>
            </Link>
          </nav>
          
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-700" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50">
                  <User className="h-3 w-3" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <form action="/auth/signout" method="post" className="mt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Welcome, {displayName}!</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  Quick overview of your printable assets.
                </p>
              </div>
            </div>

            <QuickActions />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentProjects />
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Recent Exports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-6 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center mb-2 shadow-sm border border-zinc-100 dark:border-zinc-700">
                      <FileImage className="h-5 w-5 text-zinc-400" />
                    </div>
                    <p className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">No exports yet</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'Layouts', value: '0', color: 'from-indigo-500/10 to-blue-500/10', iconColor: 'text-indigo-600 dark:text-indigo-400' },
                { title: 'Assets', value: '0', color: 'from-rose-500/10 to-orange-500/10', iconColor: 'text-rose-600 dark:text-rose-400' },
                { title: 'Storage', value: '0 MB', color: 'from-emerald-500/10 to-teal-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400' },
              ].map((stat, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm transition-all hover:shadow-md">
                  <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${stat.color} blur-xl opacity-60`}></div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{stat.title}</h3>
                  <div className={`mt-2 text-2xl font-extrabold tracking-tight ${stat.iconColor}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
