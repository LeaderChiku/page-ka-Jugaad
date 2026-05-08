"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col overflow-hidden relative">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/10 blur-[120px]" />
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-violet-500/10 blur-[100px]" />

      {/* Navigation */}
      <header className="px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className="font-bold text-xl tracking-tight">PageKaJugaad</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-medium">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button className="text-sm font-medium rounded-full px-6">Get Started</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 px-3 py-1 text-sm text-zinc-600 dark:text-zinc-400 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 mr-2"></span>
            The ultimate print layout engine
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Create perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-rose-500">print layouts</span> in seconds.
          </h1>

          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Upload your artwork, stickers, or photos. Let our smart engine arrange them perfectly onto any paper size. Export print-ready PDFs instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-8 text-base h-14 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                Start creating for free
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="rounded-full px-8 text-base h-14 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                See how it works
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Mockup / Canvas Preview Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-20 w-full max-w-6xl mx-auto relative"
        >
          <div className="aspect-[16/9] rounded-2xl md:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col p-4">
            {/* Fake Toolbar */}
            <div className="w-full h-12 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-6 w-48 rounded-md bg-zinc-200/50 dark:bg-zinc-800/50"></div>
              </div>
            </div>
            {/* Fake Content Area */}
            <div className="flex-1 flex gap-4 mt-4">
              {/* Sidebar */}
              <div className="w-64 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50 hidden md:block"></div>
              {/* Canvas */}
              <div className="flex-1 rounded-xl bg-white dark:bg-zinc-950 shadow-sm flex items-center justify-center p-8">
                {/* Paper */}
                <div className="w-[300px] h-[420px] bg-white shadow-md border border-zinc-100 grid grid-cols-2 grid-rows-3 gap-2 p-4">
                   {[1,2,3,4,5,6].map(i => (
                     <div key={i} className="w-full h-full rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20"></div>
                     </div>
                   ))}
                </div>
              </div>
              {/* Right Sidebar */}
              <div className="w-64 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50 hidden lg:block"></div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-zinc-500 text-sm mt-20 z-10">
        © {new Date().getFullYear()} PageKaJugaad. All rights reserved.
      </footer>
    </div>
  )
}
