
import { Button } from "@/components/ui/button";

export function StudioHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <h1 className="text-xl font-bold">Project Title</h1>
        <Button>Create New Layout</Button>
      </div>
    </header>
  );
}
