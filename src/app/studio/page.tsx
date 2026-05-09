import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SiteHeader } from "@/components/site-header";
import { StudioCanvas } from "@/components/studio-canvas";
import { StudioSidebar } from "@/components/studio-sidebar";

export default async function StudioPage() {
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
      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-screen-2xl mx-auto w-full">
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <StudioCanvas />
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <StudioSidebar />
        </div>
      </main>
    </div>
  );
}
