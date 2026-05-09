import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateLayoutHeader } from "@/components/create-layout-header";
import { CreateLayoutForm } from "@/components/create-layout-form";

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
      <CreateLayoutHeader />
      <main className="flex-1 p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <CreateLayoutForm />
        </div>
      </main>
    </div>
  );
}
