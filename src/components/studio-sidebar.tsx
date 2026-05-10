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
import { LayoutGrid, Shuffle, Repeat, Zap, X } from "lucide-react"

export function StudioSidebar() {
  const { 
    paperSize, setPaperSize,
    orientation, setOrientation,
    arrangementMode, setArrangementMode,
    gridCount, setGridCount,
    margin, setMargin,
    spacing, setSpacing,
    showOutlines, setShowOutlines,
    isPositioningUnlocked, setIsPositioningUnlocked
  } = useStudioStore()



  return (
    <div className="w-80 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Layout Settings</h2>
      </div>

      <div className="p-6 space-y-8">

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
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'sequential', label: 'Sequential Flow', icon: LayoutGrid, desc: 'Fills slots in selection order' },
              { id: 'repeat', label: 'Rotating Pattern', icon: Repeat, desc: 'Dynamic repeating row pattern' },
              { id: 'smart-balanced', label: 'Balanced Grid', icon: Zap, desc: 'Optimal centered distribution' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  useStudioStore.getState().clearRandomLayout()
                  setArrangementMode(mode.id as ArrangementMode)
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                  arrangementMode === mode.id && !useStudioStore.getState().randomLayoutData
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800/50 dark:text-indigo-400" 
                    : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:border-zinc-200 dark:bg-zinc-950 dark:border-zinc-900"
                )}
              >
                <div className="h-8 w-8 rounded-lg bg-white dark:bg-zinc-900 flex items-center justify-center border border-inherit">
                  <mode.icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase">{mode.label}</span>
                  <span className="text-[9px] opacity-60">{mode.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Random Generator */}
        <div className="space-y-3 pt-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Magic Features</Label>
          {useStudioStore.getState().randomLayoutData ? (
             <Button 
               variant="outline" 
               className="w-full rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
               onClick={() => useStudioStore.getState().clearRandomLayout()}
             >
               <X className="mr-2 h-4 w-4" />
               Reset to Grid Layout
             </Button>
          ) : (
             <Button 
               className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-none shadow-md"
               onClick={() => {
                 const count = prompt("How many random items to scatter? (1-50)", "12")
                 if (count) {
                    const n = parseInt(count)
                    if (!isNaN(n) && n > 0) {
                      useStudioStore.getState().generateRandomLayout(n)
                    }
                 }
               }}
             >
               <Shuffle className="mr-2 h-4 w-4" />
               Generate Random Layout
             </Button>
          )}
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

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Show Slot Outlines</Label>
              <div className="flex p-1 bg-zinc-50 dark:bg-zinc-950 rounded-lg">
                <Button 
                  size="sm"
                  variant={showOutlines ? 'default' : 'ghost'}
                  className={showOutlines ? "h-7 px-3 text-[10px] rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm hover:bg-white dark:hover:bg-zinc-800" : "h-7 px-3 text-[10px] rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"}
                  onClick={() => setShowOutlines(true)}
                >
                  On
                </Button>
                <Button 
                  size="sm"
                  variant={!showOutlines ? 'default' : 'ghost'}
                  className={!showOutlines ? "h-7 px-3 text-[10px] rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm hover:bg-white dark:hover:bg-zinc-800" : "h-7 px-3 text-[10px] rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"}
                  onClick={() => setShowOutlines(false)}
                >
                  Off
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Image Positioning</Label>
                <p className="text-[9px] text-zinc-500">Drag/Zoom individual stickers</p>
              </div>
              <Button 
                size="sm"
                variant={isPositioningUnlocked ? 'default' : 'outline'}
                className={isPositioningUnlocked 
                  ? "h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-none shadow-md shadow-amber-500/20" 
                  : "h-9 px-4 rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-600"}
                onClick={() => setIsPositioningUnlocked(!isPositioningUnlocked)}
              >
                {isPositioningUnlocked ? (
                  <Zap className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <Zap className="mr-2 h-3.5 w-3.5 opacity-40" />
                )}
                {isPositioningUnlocked ? 'Unlocked' : 'Locked'}
              </Button>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
