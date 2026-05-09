import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudioHeader } from "@/components/studio-header";
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
      <StudioHeader />
      <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <StudioCanvas />
        </div>
        <div>
          <StudioSidebar />
        </div>
      </main>
    </div>
  );
}
