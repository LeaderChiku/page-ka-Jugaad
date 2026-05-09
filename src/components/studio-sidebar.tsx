"use client"

import * as React from "react"
import { useStudioStore, PaperSize, Orientation, LayoutType } from "@/store/useStudioStore"
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

export function StudioSidebar() {
  const { 
    paperSize, setPaperSize,
    orientation, setOrientation,
    layoutType, setLayoutType,
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
          <Label className="text-xs uppercase tracking-wider text-zinc-500">Paper Size</Label>
          <Select value={paperSize} onValueChange={(v) => setPaperSize(v as PaperSize)}>
            <SelectTrigger className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950">
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
          <Label className="text-xs uppercase tracking-wider text-zinc-500">Orientation</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={orientation === 'portrait' ? 'default' : 'outline'}
              className="rounded-xl h-10 text-xs"
              onClick={() => setOrientation('portrait')}
            >
              Portrait
            </Button>
            <Button 
              variant={orientation === 'landscape' ? 'default' : 'outline'}
              className="rounded-xl h-10 text-xs"
              onClick={() => setOrientation('landscape')}
            >
              Landscape
            </Button>
          </div>
        </div>

        {/* Grid Count */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-zinc-500">Items Per Page</Label>
          <Select value={gridCount.toString()} onValueChange={(v) => setGridCount(parseInt(v))}>
            <SelectTrigger className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950">
              <SelectValue placeholder="Select count" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 4, 6, 8, 12, 20].map(n => (
                <SelectItem key={n} value={n.toString()}>{n} Items</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Layout Type */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-zinc-500">Layout Engine</Label>
          <Select value={layoutType} onValueChange={(v) => setLayoutType(v as LayoutType)}>
            <SelectTrigger className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950">
              <SelectValue placeholder="Select engine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Balanced Grid</SelectItem>
              <SelectItem value="auto">Smart Auto-Arrange</SelectItem>
              <SelectItem value="freeform" disabled>Freeform (Soon)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sliders */}
        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-xs uppercase tracking-wider text-zinc-500">Page Margin</Label>
              <span className="text-xs font-mono text-zinc-400">{margin}px</span>
            </div>
            <Slider 
              value={[margin]} 
              onValueChange={(v) => setMargin(Array.isArray(v) ? v[0] : v)} 
              max={100} 
              step={1} 
              className="py-4"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-xs uppercase tracking-wider text-zinc-500">Item Spacing</Label>
              <span className="text-xs font-mono text-zinc-400">{spacing}px</span>
            </div>
            <Slider 
              value={[spacing]} 
              onValueChange={(v) => setSpacing(Array.isArray(v) ? v[0] : v)} 
              max={50} 
              step={1} 
              className="py-4"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

