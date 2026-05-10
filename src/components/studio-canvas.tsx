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
    selectedIds,
    paperSize, 
    orientation, 
    arrangementMode,
    gridCount, 
    margin, 
    spacing,
    randomLayoutData 
  } = useStudioStore()

  const ratio = PAPER_RATIOS[paperSize]
  const isPortrait = orientation === 'portrait'
  
  // Calculate grid columns based on gridCount
  let cols = 1;
  if (gridCount >= 20) cols = 4;
  else if (gridCount >= 12) cols = 3;
  else if (gridCount >= 6) cols = 3;
  else if (gridCount >= 4) cols = 2;
  else if (gridCount >= 2) cols = 2;

  // Generate the items to display based on arrangement mode
  const displayItems = React.useMemo(() => {
    // Map selected IDs to their corresponding inventory thumbnail URLs
    const baseItems = selectedIds
      .map(id => inventory.find(item => item.id === id)?.thumbnailLink)
      .filter(Boolean) as string[]

    if (baseItems.length === 0) return []

    let result: string[] = []

    switch (arrangementMode) {
      case 'repeat':
        // Professional rotating repeat pattern
        const rowLength = cols
        for (let i = 0; i < gridCount; i++) {
          const rowIndex = Math.floor(i / rowLength)
          // Rotate start index each row: (i + rowIndex) % baseItems.length
          result.push(baseItems[(i + rowIndex) % baseItems.length])
        }
        break

      case 'smart-balanced':
        // Balanced distribution (centered if fewer items than slots)
        const totalItems = baseItems.length
        if (totalItems < gridCount && totalItems > 0) {
           const startSlot = Math.floor((gridCount - totalItems) / 2)
           for (let i = 0; i < gridCount; i++) {
             if (i >= startSlot && i < startSlot + totalItems) {
                result.push(baseItems[i - startSlot])
             } else {
                result.push("")
             }
           }
        } else {
           for (let i = 0; i < gridCount; i++) {
             result.push(baseItems[i % baseItems.length])
           }
        }
        break

      case 'sequential':
      default:
        // Fill top slots only in exact order
        for (let i = 0; i < gridCount; i++) {
          if (i < baseItems.length) {
            result.push(baseItems[i])
          } else {
            result.push("") // Empty slots
          }
        }
        break
    }

    return result
  }, [inventory, selectedIds, arrangementMode, gridCount, cols])

  return (
    <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-4 lg:p-12 overflow-auto custom-scrollbar relative">
      {/* Zoom Container to make full paper visible */}
      <div className="transform scale-[0.65] lg:scale-[0.8] transition-transform origin-center">
        <div 
          id="studio-canvas-paper"
          className="bg-white shadow-2xl transition-all duration-500 relative mx-auto"
          style={{
            width: isPortrait ? '500px' : `${500 * ratio}px`,
            height: isPortrait ? `${500 * ratio}px` : '500px',
            padding: `${margin}px`,
            backgroundColor: '#ffffff'
          }}
        >
            {randomLayoutData ? (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {randomLayoutData.map((item, idx) => (
                  <div 
                    key={idx}
                    className="absolute"
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
                      width: '100px',
                      height: '100px'
                    }}
                  >
                    <img src={item.url} className="w-full h-full object-contain drop-shadow-md" alt="Random Item" />
                  </div>
                ))}
              </div>
            ) : (
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
                    className="border border-zinc-50 dark:border-zinc-900 rounded-sm flex items-center justify-center overflow-hidden bg-zinc-50/10"
                  >
                    {displayItems[i] ? (
                      <img 
                        src={displayItems[i]} 
                        className="w-full h-full object-contain p-1" 
                        alt={`Layout Item ${i}`}
                      />
                    ) : (
                      <div className="text-[8px] text-zinc-200 font-mono flex flex-col items-center gap-1 opacity-40">
                        <div className="w-4 h-px bg-zinc-200"></div>
                        SLOT {i + 1}
                        <div className="w-4 h-px bg-zinc-200"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          {/* Paper Info Overlay (Only visible in UI, not export) */}
          <div className="absolute -top-16 left-0 right-0 flex items-end justify-between text-zinc-400 font-bold font-mono tracking-[0.2em] pointer-events-none select-none px-2">
            <div className="flex flex-col gap-1">
              <span className="text-xl text-zinc-900 dark:text-white flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
                {paperSize}
              </span>
              <span className="text-[10px] uppercase opacity-60">{orientation} Layout</span>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-4">
                <span className="text-indigo-500">{randomLayoutData ? 'RANDOM' : arrangementMode.toUpperCase()}</span>
                <span>{gridCount} SLOTS</span>
              </div>
              <div className="w-24 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${(selectedIds.length / gridCount) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State Overlay */}
      {selectedIds.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100/50 dark:bg-zinc-950/50 backdrop-blur-sm z-10">
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 text-center max-w-xs space-y-4">
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
              <ImageIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold">Canvas is Empty</h3>
            <p className="text-sm text-zinc-500">Select images from your inventory to start building your layout.</p>
          </div>
        </div>
      )}
    </div>
  )
}


function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
      <circle cx="9" cy="9" r="2"/>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  )
}
