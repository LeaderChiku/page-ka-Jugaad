import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SiteHeader } from "@/components/site-header";
import { LayoutCanvas } from "@/components/layout-canvas";
import { LayoutSidebar } from "@/components/layout-sidebar";

export default async function LayoutPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: layout, error } = await supabase
    .from('layouts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    console.error("Error fetching layout:", error)
    // Handle the error appropriately, e.g., show a not found page
    return <div>Layout not found</div>
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <SiteHeader />
      <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 py-3 px-6 md:px-10 flex items-center">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{layout.name}</h1>
      </div>
      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-screen-2xl mx-auto w-full">
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <LayoutCanvas />
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <LayoutSidebar />
        </div>
      </main>
    </div>
  );
}
