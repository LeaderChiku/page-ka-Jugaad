import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Background gradients for a premium glassmorphic feel */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/20 blur-[120px]" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-violet-500/20 blur-[100px]" />
      
      {/* Container for the auth cards */}
      <div className="z-10 w-full max-w-md p-4">
        {children}
      </div>
    </div>
  )
}
