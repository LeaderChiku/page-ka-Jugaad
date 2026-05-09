"use client"

import * as React from "react"
import { Upload, X, Search, Image as ImageIcon } from "lucide-react"
import { useStudioStore } from "@/store/useStudioStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function StudioInventory() {
  const { inventory, addImage, removeImage } = useStudioStore()
  const [search, setSearch] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          addImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const filteredInventory = inventory.filter((_, index) => 
    `Image ${index + 1}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Inventory</h2>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search assets..."
            className="pl-9 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 shadow-md shadow-indigo-500/20 transition-all"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Images
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          multiple 
          accept="image/*"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {inventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center space-y-2 text-zinc-500">
            <ImageIcon className="h-8 w-8 opacity-20" />
            <p className="text-sm">No images yet.<br/>Upload to start.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredInventory.map((img, idx) => (
              <div 
                key={idx} 
                className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 transition-all hover:ring-2 hover:ring-indigo-500"
              >
                <img src={img} alt={`Uploaded ${idx}`} className="object-cover w-full h-full" />
                <button 
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
