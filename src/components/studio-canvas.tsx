"use client"

import * as React from "react"
import { useStudioStore, PaperSize, Orientation } from "@/store/useStudioStore"
import { cn } from "@/lib/utils"

const PAPER_RATIOS: Record<PaperSize, number> = {
  'A4': 1.414,
  'A5': 1.414,
  'A6': 1.414,
  'A7': 1.414,
  'Letter': 1.294,
  'Legal': 1.647
}

export function StudioCanvas() {
  const { 
    inventory, 
    paperSize, 
    orientation, 
    gridCount, 
    margin, 
    spacing 
  } = useStudioStore()

  const ratio = PAPER_RATIOS[paperSize]
  const isPortrait = orientation === 'portrait'
  
  // Calculate grid columns and rows based on gridCount
  // We'll aim for balanced layouts
  let cols = 1;
  if (gridCount >= 20) cols = 4;
  else if (gridCount >= 12) cols = 3;
  else if (gridCount >= 6) cols = 3;
  else if (gridCount >= 4) cols = 2;
  else if (gridCount >= 2) cols = 2;

  return (
    <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-8 overflow-auto custom-scrollbar">
      <div 
        id="studio-canvas-paper"
        className="bg-white shadow-2xl transition-all duration-500 relative"
        style={{
          width: isPortrait ? '500px' : `${500 * ratio}px`,
          height: isPortrait ? `${500 * ratio}px` : '500px',
          padding: `${margin}px`
        }}
      >
        <div 
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: `${spacing}px`,
          }}
        >
          {Array.from({ length: gridCount }).map((_, i) => (
            <div 
              key={i} 
              className="border border-zinc-100 dark:border-zinc-800 rounded-sm flex items-center justify-center overflow-hidden bg-zinc-50/30"
            >
              {inventory[i % inventory.length] ? (
                <img 
                  src={inventory[i % inventory.length]} 
                  className="w-full h-full object-contain" 
                  alt="Canvas Item"
                />
              ) : (
                <div className="text-[10px] text-zinc-300 font-mono">CELL {i + 1}</div>
              )}
            </div>
          ))}
        </div>

        {/* Paper Info Overlay */}
        <div className="absolute -top-10 left-0 text-[10px] font-mono text-zinc-500 flex gap-4 uppercase tracking-widest">
          <span>{paperSize} {orientation}</span>
          <span>{gridCount} Items</span>
        </div>
      </div>
    </div>
  )
}

