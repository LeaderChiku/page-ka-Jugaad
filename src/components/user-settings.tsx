import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export function UserSettings({ user }: { user: any }) {
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
        <CardTitle className="text-lg font-semibold">User Profile</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center gap-6 mb-8">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-20 w-20 rounded-full border-2 border-white dark:border-zinc-800 shadow-xl" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-xl">
              <User className="h-8 w-8" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{displayName}</h3>
            <p className="text-zinc-500 dark:text-zinc-400">{user?.email}</p>
          </div>
        </div>

        <form className="space-y-6 opacity-60">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
            <Input id="name" defaultValue={displayName} disabled className="rounded-xl bg-zinc-50 dark:bg-zinc-950" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
            <Input id="email" type="email" defaultValue={user?.email} disabled className="rounded-xl bg-zinc-50 dark:bg-zinc-950" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button disabled className="rounded-xl px-8">Update Profile (Coming Soon)</Button>
          </div>
        </form>

        <div className="mt-10 pt-10 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.74 2L12 9.41L16.26 2H7.74M1.47 13L5.74 20.41L10 13H1.47M14 13L18.26 20.41L22.53 13H14Z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Connected Google Drive</h4>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Storage Synchronized</p>
                <p className="text-xs text-zinc-500">Folder: /PageKaJugaad</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">
              Reconnect
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

