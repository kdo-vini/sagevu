'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'

export default function BadRequestPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/discover?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface overflow-x-hidden selection:bg-primary-container/30">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center pt-24 px-6 relative overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Decorative large 400 watermark behind content */}
        <div
          className="absolute inset-0 flex items-center justify-start pl-4 md:pl-8 pointer-events-none select-none z-0"
          aria-hidden="true"
        >
          <span className="text-[18vw] font-black text-surface-container-highest/20 leading-none tracking-tighter">
            400
          </span>
        </div>

        {/* Content panel — floated to the right */}
        <div className="max-w-4xl w-full relative z-10">
          <div className="flex flex-col text-left space-y-8 glass backdrop-blur-xl bg-surface-container-lowest/60 p-8 md:p-12 rounded-2xl border border-white/5 max-w-2xl ml-auto shadow-[0_0_60px_rgba(196,192,255,0.04)]">
            {/* Label + Headline */}
            <div>
              <p className="text-outline text-xs font-bold tracking-[0.2em] uppercase mb-4">
                Error 400
              </p>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white leading-tight">
                Even Polymaths{' '}
                <br />
                <span className="gradient-text-purple">Get Lost.</span>
              </h1>
              <p className="text-on-surface-variant text-lg mt-6 max-w-md leading-relaxed">
                The request couldn&apos;t be understood — something in the query
                was malformed or missing. Try searching for a specialist below.
              </p>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="relative max-w-md group">
              <span className="absolute inset-y-0 left-4 flex items-center text-outline group-focus-within:text-primary transition-colors pointer-events-none">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  search
                </span>
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search specialists..."
                className="w-full bg-surface-container-low/50 backdrop-blur-sm border-b border-outline-variant/20 py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-outline/50"
              />
            </form>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/"
                className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container rounded-xl text-on-primary font-bold tracking-tight shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 group"
              >
                <span>Return Home</span>
                <span
                  className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/discover"
                className="px-8 py-4 border border-outline-variant/20 rounded-xl text-on-surface hover:bg-surface-container-high active:scale-95 transition-all font-semibold backdrop-blur-sm"
              >
                Discover Specialists
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 border-t border-outline-variant/20 mt-16 relative z-10 bg-surface-container-lowest">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-8 max-w-7xl mx-auto">
          <div>
            <p className="text-lg font-black tracking-tighter text-white">Sagevu</p>
            <p className="text-outline text-sm mt-1">
              © {new Date().getFullYear()} Sagevu. All rights reserved.
            </p>
          </div>
          <div className="flex gap-8">
            <Link
              href="/discover"
              className="text-outline hover:text-primary transition-colors text-sm"
            >
              Discover
            </Link>
            <Link
              href="/feed"
              className="text-outline hover:text-primary transition-colors text-sm"
            >
              Feed
            </Link>
            <Link
              href="/messages"
              className="text-outline hover:text-primary transition-colors text-sm"
            >
              Messages
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
