"use client"

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SiteHeader } from "@/components/site-header"
import { StudioCanvas } from "@/components/studio-canvas"
import { StudioSidebar } from "@/components/studio-sidebar"
import { StudioInventory } from "@/components/studio-inventory"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useStudioStore } from "@/store/useStudioStore"

export default function StudioPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [exporting, setExporting] = React.useState(false)
  const { paperSize, orientation } = useStudioStore()
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        console.log("StudioPage: Checking session...")
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          console.warn("StudioPage: No session found, redirecting to login")
          router.push('/login')
          return
        }
        console.log("StudioPage: Session verified")
      } catch (err) {
        console.error("StudioPage: Auth check error:", err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const handleExportPDF = async () => {
    const element = document.getElementById('studio-canvas-paper')
    if (!element) return

    setExporting(true)
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
      pdf.save(`Layout-${paperSize}-${orientation}-${Date.now()}.pdf`)
    } catch (err) {
      console.error("PDF Export failed:", err)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
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

