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

    setExporting(true)
    
    // TEMPORARY SANITIZATION:
    // Strip Tailwind v4 classes that use oklch/lab colors which crash html2canvas
    const slots = element.querySelectorAll('.sticker-slot')
    const originalStyles: { el: HTMLElement, className: string, bg: string, border: string }[] = []
    
    slots.forEach(slot => {
      const el = slot as HTMLElement
      originalStyles.push({ 
        el, 
        className: el.className, 
        bg: el.style.backgroundColor, 
        border: el.style.borderColor 
      })
      // Strip classes but maintain essential layout structure
      el.className = 'sticker-slot'
      el.style.backgroundColor = 'rgba(250, 250, 250, 0.1)'
      el.style.borderColor = 'transparent'
    })

    try {
      // Create a clean version for export (optional: remove UI-only elements if any)
      const canvas = await html2canvas(element, {
        scale: 4, // Ultra high quality for print
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      
      const imgData = canvas.toDataURL('image/png', 1.0)
      const isPortrait = orientation === 'portrait'
      
      // jsPDF instance
      const pdf = new jsPDF({
        orientation: isPortrait ? 'p' : 'l',
        unit: 'mm',
        format: paperSize.toLowerCase() as any
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // Add image to cover the full PDF page
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
      pdf.save(`pagekajugaad-${paperSize.toLowerCase()}-${orientation}.pdf`)
    } catch (err) {
      console.error("PDF Export failed:", err)
      toast.error("PDF generation failed", {
        description: "Please try again."
      })
    } finally {
      // Restore original UI styles immediately
      originalStyles.forEach(({ el, className, bg, border }) => {
        el.className = className
        el.style.backgroundColor = bg
        el.style.borderColor = border
      })
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

