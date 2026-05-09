import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SiteHeader } from "@/components/site-header"
import { CreateLayoutForm } from "@/components/create-layout-form"

export default async function CreateLayoutPage() {
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
      <main className="flex-1 p-6 md:p-12 flex items-center justify-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/10 blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 z-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Create New Layout</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">Set up your canvas to start arranging artwork.</p>
          </div>
          <CreateLayoutForm />
        </div>
      </main>
    </div>
  )
}
