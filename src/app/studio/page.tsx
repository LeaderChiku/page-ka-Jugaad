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

  const handleExportPDF = async () => {
    const element = document.getElementById('studio-canvas-paper')
    if (!element) return

    console.log('[PDF Export] Starting server-side PDF generation...')
    setExporting(true)
    toast.info("Generating high-quality PDF...", { description: "Using server-side Puppeteer for maximum stability." })

    let blobUrl: string | null = null;
    
    try {
      // 1. PREPARE HTML & CSS
      console.log('[PDF Export] Preparing layout data...')
      const clone = element.cloneNode(true) as HTMLElement
      
      // Cleanup UI elements that shouldn't be in the PDF
      clone.querySelectorAll('.rotate-handle').forEach(el => el.remove())
      
      // Ensure the clone has the same dimensions as the original for accurate rendering
      clone.style.width = element.offsetWidth + 'px'
      clone.style.height = element.offsetHeight + 'px'
      clone.style.margin = '0'
      clone.style.boxShadow = 'none'

      const html = clone.outerHTML
      
      // Capture all styles from the current document
      const css = Array.from(document.querySelectorAll('style'))
        .map(style => style.innerHTML)
        .join('\n')

      // 2. SEND TO API
      console.log('[PDF Export] Sending request to server...')
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
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      // 3. RECEIVE & DOWNLOAD
      console.log('[PDF Export] PDF received. Triggering download...')
      const pdfBlob = await response.blob()
      blobUrl = URL.createObjectURL(pdfBlob)
      
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `pagekajugaad-${paperSize.toLowerCase()}-${orientation}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("PDF exported successfully!")
      console.log('[PDF Export] Export process complete.')

    } catch (err: any) {
      console.error("[PDF Export] CRITICAL FAILURE:", err)
      toast.error("PDF generation failed", {
        description: err.message || "Server-side generation failed. Please try again."
      })
    } finally {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
        console.log('[PDF Export] Blob URL revoked.')
      }
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
              onClick={handleExportPDF}
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

