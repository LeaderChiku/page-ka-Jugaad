"use client"

import * as React from "react"
import { Upload, X, Search, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react"
import { useStudioStore } from "@/store/useStudioStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { uploadToDrive, fetchDriveInventory, DriveFile, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/google-drive"
import { toast } from "sonner"

export function StudioInventory() {
  const { inventory, selectedIndices, addImage, removeImage, toggleSelection } = useStudioStore()
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Sync inventory with Google Drive on mount
  React.useEffect(() => {
    const syncInventory = async () => {
      try {
        const files = await fetchDriveInventory()
        // For simplicity in this demo, we use thumbnailLink as the URL
        // In a real app, you might want to use webContentLink or a proxy
        files.forEach(file => {
          if (!inventory.includes(file.thumbnailLink)) {
            addImage(file.thumbnailLink)
          }
        })
      } catch (err) {
        console.error("Sync failed", err)
      } finally {
        setLoading(false)
      }
    }
    syncInventory()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        // Frontend Validation
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          toast.error(`"${file.name}" is not a supported image format.`, {
            description: "Please upload PNG, JPG, WEBP, or SVG files."
          })
          continue
        }

        if (file.size > MAX_FILE_SIZE) {
          toast.error(`"${file.name}" is too large.`, {
            description: "Maximum file size is 25MB."
          })
          continue
        }

        const driveId = await uploadToDrive(file, file.name)
        if (driveId) {
          toast.success(`"${file.name}" uploaded successfully.`)
          // Add to local state after successful upload
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result) {
              addImage(event.target.result as string)
            }
          }
          reader.readAsDataURL(file)
        } else {
          toast.error(`Failed to upload "${file.name}" to Google Drive.`)
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred during upload.")
    } finally {
      setUploading(false)
    }
  }

  const filteredInventory = inventory.filter((_, index) => 
    `Image ${index + 1}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Inventory</h2>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search assets..."
            className="pl-9 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 shadow-md shadow-indigo-500/20 transition-all border-none"
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {uploading ? "Uploading to Drive..." : "Upload Images"}
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          multiple 
          accept=".png,.jpg,.jpeg,.webp,.svg"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {inventory.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-center space-y-2 text-zinc-500">
            <ImageIcon className="h-8 w-8 opacity-20" />
            <p className="text-sm">No images yet.<br/>Upload to your Drive.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredInventory.map((img, idx) => {
              const selectionIndex = selectedIndices.indexOf(idx)
              const isSelected = selectionIndex !== -1

              return (
                <div 
                  key={idx} 
                  onClick={() => toggleSelection(idx)}
                  className={cn(
                    "group relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer",
                    isSelected 
                      ? "border-indigo-500 ring-2 ring-indigo-500 shadow-lg scale-[0.98]" 
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-indigo-300"
                  )}
                >
                  <img src={img} alt={`Asset ${idx}`} className="object-cover w-full h-full" />
                  
                  {/* Selection Badge */}
                  {isSelected && (
                    <div className="absolute top-2 left-2 flex items-center justify-center h-6 w-6 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-md z-10 animate-in zoom-in-50">
                      {selectionIndex + 1}
                    </div>
                  )}

                  {/* Check Overlay */}
                  <div className={cn(
                    "absolute inset-0 bg-indigo-600/10 flex items-center justify-center opacity-0 transition-opacity",
                    isSelected && "opacity-100"
                  )}>
                    <CheckCircle2 className={cn(
                      "h-6 w-6 text-indigo-600 drop-shadow-sm transition-transform",
                      isSelected ? "scale-100" : "scale-50"
                    )} />
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(idx)
                    }}
                    className="absolute top-1 right-1 p-1 bg-white/80 dark:bg-zinc-900/80 text-zinc-500 hover:text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
