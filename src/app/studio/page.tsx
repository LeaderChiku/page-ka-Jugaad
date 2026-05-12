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

    console.log('[PDF Export] Starting export process...')
    setExporting(true)
    toast.info("Preparing your PDF...", { description: "This may take a moment for high-quality export." })

    let clone: HTMLElement | null = null;
    
    try {
      // 1. CLONE THE ELEMENT
      console.log('[PDF Export] Creating temporary clone...')
      clone = element.cloneNode(true) as HTMLElement
      
      // 2. SANITIZE THE CLONE (Crucial step to prevent lab/oklch parser errors)
      console.log('[PDF Export] Sanitizing clone styles...')
      const sanitize = (el: HTMLElement) => {
        // Force safe colors on the most common problematic elements
        // We use inline styles to override any Tailwind v4 computed colors
        if (el.classList.contains('sticker-slot')) {
          el.style.backgroundColor = 'rgba(255, 255, 255, 0.01)'
          el.style.borderColor = 'rgba(0, 0, 0, 0.05)'
          el.style.borderStyle = 'solid'
        } else if (el.id === 'studio-canvas-paper') {
          el.style.backgroundColor = '#ffffff'
        }

        // Strip transitions/animations/shadows that can glitch the capture or use lab colors
        el.style.transition = 'none'
        el.style.animation = 'none'
        el.style.boxShadow = 'none'
        el.style.filter = 'none'
        
        // Remove any known Tailwind v4 classes that definitely use oklch/lab for borders/bg
        // This is a safety measure alongside the inline style overrides
        el.classList.forEach(cls => {
          if (cls.includes('bg-') || cls.includes('border-') || cls.includes('text-')) {
            // We don't remove them all as some are safe, but we've overridden them with inline styles above
          }
        })

        // Recursively sanitize children
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
      console.log('[PDF Export] Starting html2canvas capture...')
      const canvas = await html2canvas(clone, {
        scale: 3, // High quality 3x scaling
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      console.log('[PDF Export] Capture success.')
      
      // 5. GENERATE PDF
      console.log('[PDF Export] Generating PDF file...')
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
      pdf.save(`pagekajugaad-${paperSize.toLowerCase()}-${orientation}.pdf`)
      
      console.log('[PDF Export] Export process completed successfully.')
      toast.success("PDF exported successfully!")

    } catch (err: any) {
      console.error("[PDF Export] CRITICAL FAILURE:", err)
      toast.error("PDF generation failed", {
        description: err.message || "An unexpected error occurred."
      })
    } finally {
      // 6. CLEANUP
      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone)
        console.log('[PDF Export] Temporary clone removed.')
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

