"use client"

import * as React from "react"
import { useStudioStore, PaperSize, Orientation, ArrangementMode } from "@/store/useStudioStore"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LayoutGrid, Shuffle, Repeat, Zap } from "lucide-react"

export function StudioSidebar() {
  const { 
    paperSize, setPaperSize,
    orientation, setOrientation,
    arrangementMode, setArrangementMode,
    gridCount, setGridCount,
    margin, setMargin,
    spacing, setSpacing
  } = useStudioStore()

  return (
    <div className="w-80 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col h-full">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Layout Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Paper Size */}
        <div className="space-y-3">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Paper Size</Label>
          <Select value={paperSize} onValueChange={(v) => setPaperSize(v as PaperSize)}>
            <SelectTrigger className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border-none h-11">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {['A4', 'A5', 'A6', 'A7', 'Letter', 'Legal'].map(size => (
                <SelectItem key={size} value={size}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orientation */}
        <div className="space-y-3">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Orientation</Label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
            <Button 
              variant={orientation === 'portrait' ? 'default' : 'ghost'}
              className={orientation === 'portrait' ? "rounded-lg h-9 text-xs shadow-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-white dark:hover:bg-zinc-800" : "rounded-lg h-9 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"}
              onClick={() => setOrientation('portrait')}
            >
              Portrait
            </Button>
            <Button 
              variant={orientation === 'landscape' ? 'default' : 'ghost'}
              className={orientation === 'landscape' ? "rounded-lg h-9 text-xs shadow-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-white dark:hover:bg-zinc-800" : "rounded-lg h-9 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"}
              onClick={() => setOrientation('landscape')}
            >
              Landscape
            </Button>
          </div>
        </div>

        {/* Arrangement Mode */}
        <div className="space-y-3">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Arrangement Mode</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'sequential', label: 'Sequential', icon: LayoutGrid },
              { id: 'random', label: 'Random', icon: Shuffle },
              { id: 'repeat', label: 'Repeat', icon: Repeat },
              { id: 'smart-balanced', label: 'Smart', icon: Zap },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setArrangementMode(mode.id as ArrangementMode)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                  arrangementMode === mode.id 
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800/50 dark:text-indigo-400" 
                    : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:border-zinc-200 dark:bg-zinc-950 dark:border-zinc-900"
                )}
              >
                <mode.icon className="h-4 w-4" />
                <span className="text-[10px] font-medium">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid Count */}
        <div className="space-y-3">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Layout Slots</Label>
          <Select value={gridCount.toString()} onValueChange={(v) => setGridCount(parseInt(v))}>
            <SelectTrigger className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border-none h-11">
              <SelectValue placeholder="Select slots" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 4, 6, 8, 12, 20, 32].map(n => (
                <SelectItem key={n} value={n.toString()}>{n} Slots</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sliders */}
        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Page Margin</Label>
              <span className="text-[10px] font-mono font-bold text-indigo-500">{margin}px</span>
            </div>
            <Slider 
              value={[margin]} 
              onValueChange={(v) => setMargin(Array.isArray(v) ? v[0] : v)} 
              max={100} 
              step={1} 
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Item Spacing</Label>
              <span className="text-[10px] font-mono font-bold text-indigo-500">{spacing}px</span>
            </div>
            <Slider 
              value={[spacing]} 
              onValueChange={(v) => setSpacing(Array.isArray(v) ? v[0] : v)} 
              max={50} 
              step={1} 
              className="py-2"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
