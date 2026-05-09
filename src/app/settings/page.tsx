import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SiteHeader } from "@/components/site-header";
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
      <SiteHeader />
      <main className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Settings</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1.5 text-base">
            Manage your account, subscription, and preferences.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <UserSettings />
            <SubscriptionSettings />
          </div>
          <div>
            <GeneralSettings />
          </div>
        </div>
      </main>
    </div>
  );
}
