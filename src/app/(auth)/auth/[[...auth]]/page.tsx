'use client'

import { useState, useEffect } from 'react'
import { SignIn, SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  useEffect(() => {
    // Basic hash router checking so urls like /auth#signup jump directly to signup
    if (typeof window !== 'undefined') {
      if (window.location.hash.includes('signup')) {
        setMode('signup')
      }
    }
  }, [])

  const clerkAppearance = {
    elements: {
      rootBox: 'w-full',
      cardBox: 'w-full shadow-none',
      card: 'bg-transparent shadow-none p-0 w-full m-0',
      header: 'hidden',
      footer: 'hidden',
      main: 'flex flex-col gap-6',
      
      // Social buttons
      socialButtonsBlockButton: 'w-full flex items-center justify-center gap-3 bg-surface-container-high border border-outline-variant/20 hover:border-outline-variant/50 hover:bg-surface-container-high py-3 rounded-xl transition-all group',
      socialButtonsBlockButtonText: 'text-sm font-medium text-on-surface font-body normal-case',
      socialButtonsBlockButtonArrow: 'hidden',
      
      // Divider
      dividerText: 'text-[10px] uppercase tracking-widest text-outline font-body',
      dividerLine: 'bg-outline-variant/20 h-[1px]',
      
      // Form fields
      formFieldRow: 'space-y-1.5',
      formFieldLabel: 'text-[11px] uppercase tracking-widest text-outline font-bold px-1',
      formFieldInput: 'w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 text-white placeholder:text-outline/50 transition-all pb-2 px-1 outline-none text-sm rounded-none shadow-none focus:outline-none focus:ring-0 focus:border-b-primary',
      formFieldErrorText: 'text-error text-xs px-1',
      
      // Primary button
      formButtonPrimary: 'w-full py-4 bg-gradient-to-br from-[#6C63FF] to-[#4F44E2] text-white rounded-xl font-bold tracking-tight shadow-[0_10px_20px_rgba(108,99,255,0.2)] hover:shadow-[0_15px_30px_rgba(108,99,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all normal-case text-base',
      
      identityPreviewText: 'text-on-surface-variant',
      identityPreviewEditButton: 'text-primary hover:text-primary-container',
    },
  }

  return (
    <>
      {/* Sliding Toggle */}
      <div className="relative bg-surface-container-low p-1 rounded-full flex mb-8">
        <div 
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#6C63FF] rounded-full shadow-lg transition-transform duration-300 transform ${mode === 'signin' ? 'translate-x-0 left-1' : 'translate-x-full left-1'}`}
        ></div>
        <button 
          onClick={() => {
            setMode('signin')
            window.history.replaceState(null, '', '#signin')
          }} 
          className={`relative z-10 w-1/2 py-2 text-sm text-center transition-colors ${mode === 'signin' ? 'font-bold text-white' : 'font-medium text-outline hover:text-white'}`}
        >
          Sign In
        </button>
        <button 
          onClick={() => {
            setMode('signup')
            window.history.replaceState(null, '', '#signup')
          }} 
          className={`relative z-10 w-1/2 py-2 text-sm text-center transition-colors ${mode === 'signup' ? 'font-bold text-white' : 'font-medium text-outline hover:text-white'}`}
        >
          Create Account
        </button>
      </div>

      {/* 
        We use display:none to hide the inactive form to ensure Clerk is perfectly mounted without reloading the iframe.
        Using path routing or hash routing in Clerk forces it to hijack the browser history in ways we don't want.
        Instead, we use routing="virtual", making the form fully unaware of the URL, and we just orchestrate the toggle via our state.
        This provides instantaneous toggling. 
      */}
      <div className={mode === 'signin' ? 'block' : 'hidden'}>
        <SignIn appearance={clerkAppearance} routing="virtual" />
      </div>
      <div className={mode === 'signup' ? 'block' : 'hidden'}>
        <SignUp appearance={clerkAppearance} routing="virtual" />
      </div>
      
      <p className="mt-8 text-center text-[11px] text-outline leading-relaxed">
        By entering, you agree to our <Link href="#" className="text-on-surface hover:text-primary transition-colors">Terms of Intelligence</Link> and <Link href="#" className="text-on-surface hover:text-primary transition-colors">Privacy Architecture</Link>.
      </p>
    </>
  )
}
