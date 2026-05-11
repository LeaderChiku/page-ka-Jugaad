"use client"

import * as React from "react"
import { useStudioStore, PaperSize, Orientation } from "@/store/useStudioStore"
import { cn } from "@/lib/utils"
import { RotateCw, RefreshCcw } from "lucide-react"
import { getDriveImageProxyUrl } from "@/lib/google-drive"

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

    showOutlines,
    isPositioningUnlocked,
    imageTransforms,
    updateImageTransform,
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
    // Map selected IDs to their corresponding inventory metadata
    const baseItems = selectedIds
      .map(id => {
        const item = inventory.find(f => f.id === id)
        return item ? { id: item.id, url: getDriveImageProxyUrl(item.id) } : null
      })
      .filter(Boolean) as { id: string, url: string }[]

    if (baseItems.length === 0) return []

    let result: { id: string, url: string }[] = []

    switch (arrangementMode) {
      case 'repeat':
        for (let i = 0; i < gridCount; i++) {
          const rowIndex = Math.floor(i / cols)
          result.push(baseItems[(i + rowIndex) % baseItems.length])
        }
        break

      case 'smart-balanced':
        const totalItems = baseItems.length
        if (totalItems < gridCount && totalItems > 0) {
           const startSlot = Math.floor((gridCount - totalItems) / 2)
           for (let i = 0; i < gridCount; i++) {
             if (i >= startSlot && i < startSlot + totalItems) {
                result.push(baseItems[i - startSlot])
             } else {
                result.push({ id: "", url: "" })
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
        for (let i = 0; i < gridCount; i++) {
          if (i < baseItems.length) {
            result.push(baseItems[i])
          } else {
            result.push({ id: "", url: "" })
          }
        }
        break
    }

    return result
  }, [inventory, selectedIds, arrangementMode, gridCount, cols])


  const rows = Math.ceil(gridCount / cols)

  // Advanced Positioning Handlers
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [rotatingId, setRotatingId] = React.useState<string | null>(null)
  const [lastPos, setLastPos] = React.useState({ x: 0, y: 0 })
  const [rotationCenter, setRotationCenter] = React.useState({ x: 0, y: 0 })
  const [startAngle, setStartAngle] = React.useState(0)
  const [initialRotation, setInitialRotation] = React.useState(0)

  const handleWheel = (e: React.WheelEvent, id: string) => {
    if (!isPositioningUnlocked || !id) return
    e.preventDefault()
    e.stopPropagation()
    const transform = imageTransforms[id] || { zoom: 1, x: 0, y: 0 }
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.1, Math.min(10, transform.zoom + delta))
    updateImageTransform(id, { zoom: newZoom })
  }

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (!isPositioningUnlocked || !id) return
    // Prevent dragging if we're clicking the rotate handle
    if ((e.target as HTMLElement).closest('.rotate-handle')) return
    
    setDraggingId(id)
    setLastPos({ x: e.clientX, y: e.clientY })
  }

  const handleRotateMouseDown = (e: React.MouseEvent, id: string) => {
    if (!isPositioningUnlocked || !id) return
    e.preventDefault()
    e.stopPropagation()

    const slot = e.currentTarget.closest('.sticker-slot') as HTMLElement
    if (!slot) return

    const rect = slot.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    setRotatingId(id)
    setRotationCenter({ x: centerX, y: centerY })
    setStartAngle(Math.atan2(e.clientY - centerY, e.clientX - centerX))
    setInitialRotation(imageTransforms[id]?.rotation || 0)
  }

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingId) {
        const dx = e.clientX - lastPos.x
        const dy = e.clientY - lastPos.y
        const transform = imageTransforms[draggingId] || { zoom: 1, x: 0, y: 0, rotation: 0 }
        updateImageTransform(draggingId, { 
          x: transform.x + dx, 
          y: transform.y + dy 
        })
        setLastPos({ x: e.clientX, y: e.clientY })
      } else if (rotatingId) {
        const currentAngle = Math.atan2(e.clientY - rotationCenter.y, e.clientX - rotationCenter.x)
        const angleDiff = (currentAngle - startAngle) * (180 / Math.PI)
        updateImageTransform(rotatingId, { 
          rotation: (initialRotation + angleDiff) % 360 
        })
      }
    }

    const handleMouseUp = () => {
      setDraggingId(null)
      setRotatingId(null)
    }

    if (draggingId || rotatingId) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingId, rotatingId, lastPos, rotationCenter, startAngle, initialRotation, imageTransforms, updateImageTransform])

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
                      height: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img 
                      src={item.url} 
                      crossOrigin="anonymous"
                      className="block object-contain drop-shadow-md" 
                      alt="Random Item" 
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto'
                      }}
                    />
                  </div>
                ))}

              </div>
            ) : (
              <div 
                className="grid h-full w-full align-content-start"
                style={{
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, 1fr)`,
                  gap: `${spacing}px`,
                }}
              >
                {Array.from({ length: gridCount }).map((_, i) => {
                  const item = displayItems[i]
                  const transform = item?.id ? (imageTransforms[item.id] || { zoom: 1, x: 0, y: 0, rotation: 0 }) : { zoom: 1, x: 0, y: 0, rotation: 0 }
                  
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "rounded-sm flex items-center justify-center overflow-hidden bg-zinc-50/10 transition-colors relative group sticker-slot",
                        showOutlines ? "border border-zinc-100 dark:border-zinc-800" : "border border-transparent",
                        isPositioningUnlocked && item?.id && "cursor-move ring-1 ring-inset ring-amber-500/20 hover:ring-amber-500/50"
                      )}
                      onWheel={(e) => item?.id && handleWheel(e, item.id)}
                      onMouseDown={(e) => item?.id && handleMouseDown(e, item.id)}
                    >
                      {item?.url ? (
                        <div 
                          className="w-full h-full flex items-center justify-center transition-transform duration-75"
                          style={{
                            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom}) rotate(${transform.rotation}deg)`,
                          }}
                        >
                          <img 
                            src={item.url} 
                            crossOrigin="anonymous"
                            className="block object-contain pointer-events-none select-none" 
                            alt={`Layout Item ${i}`}
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '100%', 
                              width: 'auto', 
                              height: 'auto',
                              padding: '2px'
                            }}
                          />

                          {/* Rotation Handle */}
                          {isPositioningUnlocked && (
                            <button
                              onMouseDown={(e) => handleRotateMouseDown(e, item.id)}
                              onDoubleClick={() => updateImageTransform(item.id, { rotation: 0 })}
                              className="rotate-handle absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-10 cursor-alias border-none"
                              title="Drag to rotate • Double-click to reset"
                            >
                              <RotateCw className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        showOutlines && (
                          <div className="text-[8px] font-mono flex flex-col items-center gap-1 opacity-40 text-zinc-200">
                            <div className="w-4 h-px bg-zinc-200"></div>
                            SLOT {i + 1}
                            <div className="w-4 h-px bg-zinc-200"></div>
                          </div>
                        )
                      )}
                    </div>
                  )
                })}

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
