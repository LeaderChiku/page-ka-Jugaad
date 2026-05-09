import Link from "next/link";
import { MainNav } from "@/components/main-nav";
import { ModeToggle } from "@/components/ui/mode-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-all">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-8">
            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg leading-none">P</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white hidden sm:inline-block">
                PageKaJugaad
              </span>
            </Link>
            <div className="hidden md:flex">
              <MainNav />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
