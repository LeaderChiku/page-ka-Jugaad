import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SiteHeader } from "@/components/site-header"
import { FolderOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function RecentProjectsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <SiteHeader />
      <main className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Recent Projects</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1.5 text-base">
            Manage your past print layouts and projects here.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 shadow-sm mt-8">
          <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
            <FolderOpen className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No projects found</h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8 text-base">
            You haven't created any print layouts yet. Start by creating a new layout to organize your artwork.
          </p>
          <Link href="/create-layout">
            <Button className="rounded-full px-8 h-12 text-base font-medium">
              Create Your First Layout
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
