import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function RecentProjects() {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Recent Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="h-12 w-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center mb-3 shadow-sm border border-zinc-100 dark:border-zinc-700">
            <FolderOpen className="h-6 w-6 text-zinc-400" />
          </div>
          <p className="text-zinc-900 dark:text-zinc-100 font-medium">No projects yet</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-[200px] mb-4">Start creating your first print-ready layout.</p>
          <Link href="/create-layout">
            <Button size="sm" className="rounded-full px-6">
              Create Layout
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
