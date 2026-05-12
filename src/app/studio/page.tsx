"use client"

import * as React from 'react'
import { SiteHeader } from "@/components/site-header"
import { StudioCanvas } from "@/components/studio-canvas"
import { StudioSidebar } from "@/components/studio-sidebar"
import { StudioInventory } from "@/components/studio-inventory"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useStudioStore } from "@/store/useStudioStore"
import { toast } from "sonner"

export default function StudioPage() {
  const [exporting, setExporting] = React.useState(false)
  const { paperSize, orientation } = useStudioStore()

  const handleExportPDF = async () => {
    const element = document.getElementById('studio-canvas-paper')
    if (!element) return

    console.log('[PDF Export] Starting storage-safe export process...')
    setExporting(true)
    toast.info("Preparing your PDF...", { description: "Processing entirely in your browser for privacy." })

    let clone: HTMLElement | null = null;
    let blobUrl: string | null = null;
    
    try {
      // 1. CLONE THE ELEMENT (Isolated from live UI)
      console.log('[PDF Export] Creating isolated clone...')
      clone = element.cloneNode(true) as HTMLElement
      
      // 2. SANITIZE THE CLONE (Remove problematic lab/oklch colors)
      console.log('[PDF Export] Sanitizing clone tree...')
      const sanitize = (el: HTMLElement) => {
        // Force safe colors on common problematic elements
        if (el.classList.contains('sticker-slot')) {
          el.style.backgroundColor = 'rgba(255, 255, 255, 0.01)'
          el.style.borderColor = 'rgba(0, 0, 0, 0.05)'
          el.style.borderStyle = 'solid'
        } else if (el.id === 'studio-canvas-paper') {
          el.style.backgroundColor = '#ffffff'
        }

        // Strip transitions/animations/shadows that can glitch capture or use lab colors
        el.style.transition = 'none'
        el.style.animation = 'none'
        el.style.boxShadow = 'none'
        el.style.filter = 'none'
        
        Array.from(el.children).forEach(child => sanitize(child as HTMLElement))
      }
      
      sanitize(clone)
      console.log('[PDF Export] Sanitization complete.')
      
      // 3. ATTACH CLONE TEMPORARILY
      // Attaching hidden to the DOM ensures correct layout calculation by html2canvas
      clone.style.position = 'fixed'
      clone.style.left = '-9999px'
      clone.style.top = '0'
      clone.style.zIndex = '-1000'
      document.body.appendChild(clone)
      
      // 4. CAPTURE WITH HTML2CANVAS
      console.log('[PDF Export] Capturing canvas...')
      const canvas = await html2canvas(clone, {
        scale: 3, // High quality 3x scaling
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      console.log('[PDF Export] Capture success.')
      
      // 5. GENERATE PDF BLOB (Client-side memory only)
      console.log('[PDF Export] Generating PDF blob...')
      const imgData = canvas.toDataURL('image/png', 1.0)
      const isPortrait = orientation === 'portrait'
      
      const pdf = new jsPDF({
        orientation: isPortrait ? 'p' : 'l',
        unit: 'mm',
        format: paperSize.toLowerCase() as any
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
      
      const pdfBlob = pdf.output('blob')
      console.log(`[PDF Export] Blob generated (${(pdfBlob.size / 1024 / 1024).toFixed(2)} MB).`)

      // 6. TRIGGER DIRECT DOWNLOAD
      console.log('[PDF Export] Download triggered.')
      blobUrl = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `pagekajugaad-${paperSize.toLowerCase()}-${orientation}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("PDF exported successfully!")

    } catch (err: any) {
      console.error("[PDF Export] CRITICAL FAILURE:", err)
      toast.error("PDF generation failed", {
        description: err.message || "An unexpected error occurred."
      })
    } finally {
      // 7. AGGRESSIVE CLEANUP
      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone)
        console.log('[PDF Export] Temporary DOM removed.')
      }
      
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
        console.log('[PDF Export] Blob URL revoked.')
      }

      console.log('[PDF Export] Memory cleanup complete.')
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

