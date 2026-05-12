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

    console.log('[PDF Export] Starting isolated iframe export process...')
    setExporting(true)
    toast.info("Preparing your PDF...", { description: "Isolating render context for maximum stability." })

    let iframe: HTMLIFrameElement | null = null;
    let blobUrl: string | null = null;
    
    try {
      // 1. CREATE ISOLATED IFRAME
      console.log('[PDF Export] Creating isolated iframe...')
      iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.left = '-99999px'
      iframe.style.top = '0'
      iframe.style.width = element.offsetWidth + 'px'
      iframe.style.height = element.offsetHeight + 'px'
      document.body.appendChild(iframe)

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) throw new Error('Could not create isolated render context.')

      // 2. INJECT MINIMAL CLEAN DOCUMENT
      console.log('[PDF Export] Injecting minimal document...')
      iframeDoc.open()
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; background: white; }
              * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
              .sticker-slot { display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; }
              img { display: block; max-width: 100%; max-height: 100%; width: auto; height: auto; }
            </style>
          </head>
          <body></body>
        </html>
      `)
      iframeDoc.close()

      // 3. CLONE AND SANITIZE INTO IFRAME
      console.log('[PDF Export] Cloning canvas into isolated context...')
      const clone = element.cloneNode(true) as HTMLElement
      
      // DEEP SANITIZATION: Force absolute safe inline styles, NO CSS variables, NO Tailwind classes
      const forceSafeStyles = (el: HTMLElement) => {
        const computed = window.getComputedStyle(el)
        
        // Essential layout properties must be preserved but converted to fixed units/safe colors
        const safeStyles: Partial<CSSStyleDeclaration> = {
          backgroundColor: el.id === 'studio-canvas-paper' ? '#ffffff' : (el.classList.contains('sticker-slot') ? 'rgba(255,255,255,0.01)' : 'transparent'),
          borderColor: el.classList.contains('sticker-slot') ? 'rgba(0,0,0,0.05)' : 'transparent',
          color: '#000000',
          transition: 'none',
          animation: 'none',
          boxShadow: 'none',
          filter: 'none',
          transform: el.style.transform, // Keep the user's rotation/zoom
          position: computed.position,
          display: computed.display,
          width: computed.width,
          height: computed.height,
          padding: computed.padding,
          margin: computed.margin,
          gridTemplateColumns: computed.gridTemplateColumns,
          gridTemplateRows: computed.gridTemplateRows,
          gap: computed.gap,
          top: computed.top,
          left: computed.left,
          right: computed.right,
          bottom: computed.bottom,
          zIndex: computed.zIndex
        }

        // Apply as inline styles to override everything
        Object.entries(safeStyles).forEach(([prop, val]) => {
          if (val) el.style.setProperty(prop.replace(/[A-Z]/g, m => "-" + m.toLowerCase()), val as string, 'important')
        })

        // Completely strip all classes to prevent any style leakage from external sheets
        el.className = el.classList.contains('sticker-slot') ? 'sticker-slot' : ''
        
        Array.from(el.children).forEach(child => forceSafeStyles(child as HTMLElement))
      }

      forceSafeStyles(clone)
      iframeDoc.body.appendChild(clone)
      console.log('[PDF Export] Isolated render tree ready.')

      // 4. CAPTURE INSIDE IFRAME CONTEXT
      console.log('[PDF Export] Running html2canvas in isolated context...')
      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        windowWidth: element.offsetWidth,
        windowHeight: element.offsetHeight,
      })
      console.log('[PDF Export] Capture success.')

      // 5. GENERATE PDF BLOB
      console.log('[PDF Export] Generating PDF blob...')
      const imgData = canvas.toDataURL('image/png', 1.0)
      const isPortrait = orientation === 'portrait'
      
      const pdf = new jsPDF({
        orientation: isPortrait ? 'p' : 'l',
        unit: 'mm',
        format: paperSize.toLowerCase() as any
      })

      pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), undefined, 'FAST')
      const pdfBlob = pdf.output('blob')
      
      // 6. DOWNLOAD
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
        description: "Isolating render context failed. Please try again."
      })
    } finally {
      // 7. COMPLETE CLEANUP
      if (iframe && document.body.contains(iframe)) {
        document.body.removeChild(iframe)
        console.log('[PDF Export] Isolated iframe destroyed.')
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

