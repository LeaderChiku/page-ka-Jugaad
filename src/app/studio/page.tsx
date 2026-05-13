"use client"

import * as React from 'react'
import { SiteHeader } from "@/components/site-header"
import { StudioCanvas } from "@/components/studio-canvas"
import { StudioSidebar } from "@/components/studio-sidebar"
import { StudioInventory } from "@/components/studio-inventory"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import { useStudioStore } from "@/store/useStudioStore"
import { toast } from "sonner"

export default function StudioPage() {
  const [exporting, setExporting] = React.useState(false)
  const { paperSize, orientation } = useStudioStore()

  const handleExport = async () => {
    const element = document.getElementById('studio-canvas-paper')
    if (!element) {
      console.error('[Export] Canvas element not found')
      return
    }

    setExporting(true)
    toast.info("Generating high-quality PDF...", { 
      description: "Preparing your layout for professional export." 
    })

    let blobUrl: string | null = null;
    
    try {
      // 1. PREPARE HTML & CSS
      // We clone the element to modify it for export without affecting the UI
      const clone = element.cloneNode(true) as HTMLElement
      
      // Cleanup UI-only elements like handles
      clone.querySelectorAll('.rotate-handle').forEach(el => el.remove())
      
      // Force dimensions for accurate server-side rendering
      clone.style.width = element.offsetWidth + 'px'
      clone.style.height = element.offsetHeight + 'px'
      clone.style.margin = '0'
      clone.style.boxShadow = 'none'

      const html = clone.outerHTML
      
      // Collect all document styles to ensure Tailwind v4 features are preserved
      const css = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => {
          if (el.tagName === 'STYLE') return el.innerHTML;
          // For external sheets, we'd ideally fetch them, but for Tailwind in Next.js, 
          // most styles are in <style> tags or the global bundle.
          return '';
        })
        .join('\n')

      // 2. SEND TO SERVER-SIDE PUPPETEER API
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html,
          css,
          paperSize,
          orientation,
          dimensions: {
            width: element.offsetWidth,
            height: element.offsetHeight
          },
          cookies: document.cookie
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      // 3. HANDLE PDF DOWNLOAD
      const pdfBlob = await response.blob()
      blobUrl = URL.createObjectURL(pdfBlob)
      
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `pagekajugaad-${paperSize.toLowerCase()}-${orientation}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("PDF exported successfully!")

    } catch (err: any) {
      console.error("[Export] Failure:", err)
      toast.error("Export failed", {
        description: err.message || "Something went wrong while generating the PDF."
      })
    } finally {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
      setExporting(false)
    }
  }

  return (
    <div className="h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col overflow-hidden">
      <SiteHeader />
      
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Inventory Sidebar */}
        <div className="w-72 hidden lg:block h-full">
          <StudioInventory />
        </div>

        {/* Center Canvas Area */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-950/50">


          <StudioCanvas />
          
          {/* Floating Export Button */}
          <div className="absolute bottom-8 right-8 z-20">
            <Button 
              size="lg" 
              onClick={handleExport}
              disabled={exporting}
              className="rounded-full px-8 py-7 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-500/40 border-none group transition-all transform hover:scale-105 active:scale-95"
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                  Generate PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Settings Sidebar */}
        <StudioSidebar />
      </main>
    </div>
  )
}

