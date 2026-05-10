"use client"

import * as React from "react"
import { Upload, X, Search, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react"
import { useStudioStore } from "@/store/useStudioStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { uploadToDrive, fetchDriveInventory, deleteFromDrive, DriveFile, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/google-drive"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function StudioInventory() {
  const { inventory, selectedIds, addImage, removeImage, toggleSelection, clearInventory } = useStudioStore()
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const [deleteItem, setDeleteItem] = React.useState<DriveFile | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Sync inventory with Google Drive on mount
  const syncInventory = React.useCallback(async () => {
    setLoading(true)
    try {
      const files = await fetchDriveInventory()
      clearInventory() // Clear local state first to sync properly
      files.forEach(file => {
        addImage(file)
      })
    } catch (err: any) {
      console.error("Sync failed", err)
      if (err.message === 'AUTH_EXPIRED') {
        toast.error("Google session expired.", {
          description: "Please log out and log in again to reconnect your Drive."
        })
      } else {
        toast.error("Failed to sync with Google Drive.")
      }
    } finally {
      setLoading(false)
    }
  }, [addImage, clearInventory])

  React.useEffect(() => {
    syncInventory()
  }, [syncInventory])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    let successCount = 0
    let failCount = 0

    try {
      for (const file of Array.from(files)) {
        // Frontend Validation
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          toast.error(`"${file.name}" is not supported.`, {
            description: "Please upload PNG, JPG, WEBP, or SVG files."
          })
          failCount++
          continue
        }

        if (file.size > MAX_FILE_SIZE) {
          toast.error(`"${file.name}" is too large.`, {
            description: "Maximum file size is 25MB."
          })
          failCount++
          continue
        }

        const driveId = await uploadToDrive(file, file.name)
        if (driveId) {
          successCount++
        } else {
          failCount++
          toast.error(`Failed to upload "${file.name}"`)
        }
      }

      if (successCount > 0) {
        toast.success(`Uploaded ${successCount} image${successCount > 1 ? 's' : ''} successfully.`)
        // Refresh full inventory once after all uploads are done
        await syncInventory()
      }
    } catch (err) {
      toast.error("An unexpected error occurred during upload.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    
    setDeleting(true)
    try {
      const success = await deleteFromDrive(deleteItem.id)
      if (success) {
        removeImage(deleteItem.id)
        toast.success("Image deleted successfully.")
      } else {
        toast.error("Failed to delete image from Google Drive.")
      }
    } catch (err) {
      toast.error("An error occurred during deletion.")
    } finally {
      setDeleting(false)
      setDeleteItem(null)
    }
  }

  const filteredInventory = inventory.filter((item, index) => 
    (item.name || `Image ${index + 1}`).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
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
          {uploading ? "Uploading..." : "Upload Images"}
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

      <div className="p-4">

        {inventory.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-center space-y-2 text-zinc-500">
            <ImageIcon className="h-8 w-8 opacity-20" />
            <p className="text-sm">No images yet.<br/>Upload to your Drive.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredInventory.map((img) => {
              const selectionOrder = selectedIds.indexOf(img.id)
              const isSelected = selectionOrder !== -1

              return (
                <div 
                  key={img.id} 
                  onClick={() => toggleSelection(img.id)}
                  className={cn(
                    "group relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer",
                    isSelected 
                      ? "border-indigo-500 ring-2 ring-indigo-500 shadow-lg scale-[0.98]" 
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-indigo-300"
                  )}
                >
                  <img src={img.thumbnailLink} alt={img.name} className="object-cover w-full h-full" />
                  
                  {/* Selection Badge */}
                  {isSelected && (
                    <div className="absolute top-2 left-2 flex items-center justify-center h-6 w-6 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-md z-10 animate-in zoom-in-50">
                      {selectionOrder + 1}
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

                  {/* Remove Button with Tooltip */}
                  <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteItem(img)
                            }}
                            className="absolute top-1.5 right-1.5 p-1.5 bg-white/90 dark:bg-zinc-900/90 text-zinc-500 hover:text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-md border border-zinc-200 dark:border-zinc-800"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                      <TooltipContent side="left" className="bg-zinc-900 text-white border-none shadow-xl">
                        Delete
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteItem !== null} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Delete Image?</DialogTitle>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400 mt-2">
              This will permanently delete "{deleteItem?.name}" from your Google Drive inventory. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteItem(null)}
              disabled={deleting}
              className="rounded-xl border-zinc-200 dark:border-zinc-800"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-none shadow-lg shadow-rose-500/20 px-6"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

