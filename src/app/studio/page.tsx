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
      const clone = element.cloneNode(true) as HTMLElement
      
      // Deep cleanup of UI-only elements
      // Remove rotation handles and paper info overlays
      // We avoid removing .pointer-events-none globally because the stickers themselves use it
      clone.querySelectorAll('.rotate-handle, .paper-info-overlay, button, [role="button"]').forEach(el => el.remove())
      
      // Preserve the exact computed dimensions and styles
      // We force it to fill the target paper container (100%) during export
      clone.style.width = '100%'
      clone.style.height = '100%'
      clone.style.margin = '0'
      clone.style.boxShadow = 'none'
      clone.style.position = 'relative'
      clone.style.overflow = 'hidden'
      clone.style.backgroundColor = '#ffffff' // Ensure white background for PDF
      
      // Remove any fixed dimensions that might be on the ID directly
      clone.removeAttribute('id') 
      
      const html = clone.outerHTML
      
      // Advanced CSS Collection: Extract all rules from all stylesheets
      // This is necessary for Tailwind v4 and modern CSS features
      let css = ''
      try {
        const sheets = Array.from(document.styleSheets)
        for (const sheet of sheets) {
          try {
            const rules = Array.from(sheet.cssRules)
            css += rules.map(rule => rule.cssText).join('\n')
          } catch (e) {
            // Cross-origin sheets might throw security errors, skip them
            console.warn('[Export] Could not read stylesheet rules:', e)
          }
        }
      } catch (e) {
        console.error('[Export] Style collection failed:', e)
      }

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

