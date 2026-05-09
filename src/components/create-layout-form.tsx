"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useStudioStore, PaperSize, Orientation, ArrangementMode } from "@/store/useStudioStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Sparkles, Layout as LayoutIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CreateLayoutForm() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [size, setSize] = React.useState<PaperSize>("A4")
  const [orient, setOrient] = React.useState<Orientation>("portrait")
  const [slots, setSlots] = React.useState(12)
  
  const { setPaperSize, setOrientation, setGridCount, setArrangementMode, clearInventory } = useStudioStore()

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Apply settings to store
    setPaperSize(size)
    setOrientation(orient)
    setGridCount(slots)
    setArrangementMode('sequential')
    
    // Redirect to studio
    router.push("/studio")
  }

  return (
    <div className="relative">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute -top-16 left-0 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors group"
      >
        <div className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </div>
        Back to Dashboard
      </button>

      <form onSubmit={handleCreate} className="space-y-8">
        <div className="space-y-6">
          {/* Layout Name */}
          <div className="space-y-2">
            <Label htmlFor="layout-name" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Layout Name</Label>
            <Input 
              id="layout-name" 
              placeholder="e.g. My Sticker Sheet #1" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Paper Size */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Paper Size</Label>
              <Select value={size} onValueChange={(v) => setSize(v as PaperSize)}>
                <SelectTrigger className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border-none h-12">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {['A4', 'A5', 'A6', 'A7', 'Letter', 'Legal'].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Slots */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Layout Slots</Label>
              <Select value={slots.toString()} onValueChange={(v) => setSlots(parseInt(v))}>
                <SelectTrigger className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border-none h-12">
                  <SelectValue placeholder="Select slots" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 4, 6, 8, 12, 20, 32].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n} Slots</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Orientation */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Orientation</Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
              <Button 
                type="button"
                variant={orient === 'portrait' ? 'default' : 'ghost'}
                className={orient === 'portrait' ? "rounded-lg h-10 text-xs shadow-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-white dark:hover:bg-zinc-800 border-none" : "rounded-lg h-10 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 border-none"}
                onClick={() => setOrient('portrait')}
              >
                Portrait
              </Button>
              <Button 
                type="button"
                variant={orient === 'landscape' ? 'default' : 'ghost'}
                className={orient === 'landscape' ? "rounded-lg h-10 text-xs shadow-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-white dark:hover:bg-zinc-800 border-none" : "rounded-lg h-10 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 border-none"}
                onClick={() => setOrient('landscape')}
              >
                Landscape
              </Button>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all transform active:scale-95"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Create & Open Studio
        </Button>
      </form>
    </div>
  )
}
