import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LayoutHeader } from "@/components/layout-header";
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
      <LayoutHeader layoutName={layout.name} />
      <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <LayoutCanvas />
        </div>
        <div>
          <LayoutSidebar />
        </div>
      </main>
    </div>
  );
}
