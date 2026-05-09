import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsHeader } from "@/components/settings-header";
import { UserSettings } from "@/components/user-settings";
import { SubscriptionSettings } from "@/components/subscription-settings";
import { GeneralSettings } from "@/components/general-settings";

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <SettingsHeader />
      <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserSettings />
        <SubscriptionSettings />
        <GeneralSettings />
      </main>
    </div>
  );
}
