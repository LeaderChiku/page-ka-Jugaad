import { SiteHeader } from "@/components/site-header"
import { UploadCloud, Layers, FileDown, Rocket } from "lucide-react"

export default function HowItWorksPage() {
  const steps = [
    {
      title: "1. Upload Your Artwork",
      description: "Drag and drop your stickers, photos, or graphic files. We support PNG, JPEG, SVG, and more.",
      icon: <UploadCloud className="h-8 w-8 text-indigo-500" />,
      color: "bg-indigo-500/10 border-indigo-500/20"
    },
    {
      title: "2. Arrange on Canvas",
      description: "Our smart engine automatically organizes your assets onto your selected paper size, saving you hours of manual positioning.",
      icon: <Layers className="h-8 w-8 text-rose-500" />,
      color: "bg-rose-500/10 border-rose-500/20"
    },
    {
      title: "3. Export Print-Ready PDF",
      description: "Download a high-resolution, perfectly scaled PDF file that is immediately ready for any standard printer.",
      icon: <FileDown className="h-8 w-8 text-emerald-500" />,
      color: "bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "4. Manage Projects",
      description: "Save your layouts, duplicate previous setups, and manage all your print jobs from your dedicated dashboard.",
      icon: <Rocket className="h-8 w-8 text-amber-500" />,
      color: "bg-amber-500/10 border-amber-500/20"
    }
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <SiteHeader />
      <main className="flex-1 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/10 blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 py-20 lg:py-32 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-20">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-rose-500">PageKaJugaad</span> Works
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              The fastest way to go from individual digital assets to perfectly arranged, print-ready physical sheets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className={`w-16 h-16 rounded-2xl ${step.color} border flex items-center justify-center mb-6`}>
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
