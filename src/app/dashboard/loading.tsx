import { LayoutDashboard } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-16 h-16 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 shadow-inner">
          <LayoutDashboard className="h-8 w-8 text-zinc-400 dark:text-zinc-600" />
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  )
}
