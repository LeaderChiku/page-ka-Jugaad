
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
      <Link href="/create-layout">
        <Button size="lg" className="rounded-full px-8 text-base h-14 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          Create New Layout
        </Button>
      </Link>
      <Link href="/recent-projects">
        <Button size="lg" variant="outline" className="rounded-full px-8 text-base h-14 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
          Recent Projects
        </Button>
      </Link>
    </div>
  );
}
