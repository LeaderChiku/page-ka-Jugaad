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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <SiteHeader />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden md:flex flex-col z-10">
          <nav className="flex-1 px-4 py-6 space-y-2">
            <p className="px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Menu</p>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg transition-colors">
              <LayoutDashboard className="h-4 w-4 text-indigo-500" />
              <span className="font-medium text-sm">Dashboard</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors">
              <Settings className="h-4 w-4" />
              <span className="font-medium text-sm">Settings</span>
            </Link>
          </nav>
          
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-700" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50">
                  <User className="h-4 w-4" />
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
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back, {displayName}!</h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1.5 text-base">
                  Here's what's happening with your layouts.
                </p>
              </div>
            </div>

            <QuickActions />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RecentProjects />
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Recent Exports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="h-12 w-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center mb-3 shadow-sm border border-zinc-100 dark:border-zinc-700">
                      <FileImage className="h-6 w-6 text-zinc-400" />
                    </div>
                    <p className="text-zinc-900 dark:text-zinc-100 font-medium">No exports yet</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-[200px]">Your completed print layouts will appear here.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
                <CardTitle className="text-lg font-semibold">Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { title: 'Total Layouts', value: '0', color: 'from-indigo-500/20 to-blue-500/20', iconColor: 'text-indigo-600 dark:text-indigo-400' },
                    { title: 'Assets Uploaded', value: '0', color: 'from-rose-500/20 to-orange-500/20', iconColor: 'text-rose-600 dark:text-rose-400' },
                    { title: 'Storage Used', value: '0 MB', color: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400' },
                  ].map((stat, i) => (
                    <div key={i} className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm transition-all hover:shadow-md">
                      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${stat.color} blur-2xl opacity-60`}></div>
                      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.title}</h3>
                      <div className={`mt-3 text-4xl font-bold tracking-tight ${stat.iconColor}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
