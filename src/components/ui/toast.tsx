'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border text-sm font-medium animate-slide-up',
        type === 'success' && 'bg-surface-container border-primary/30 text-primary',
        type === 'error' && 'bg-surface-container border-error/30 text-error',
        type === 'info' && 'bg-surface-container border-outline-variant/30 text-on-surface'
      )}
    >
      <span className="material-symbols-outlined text-base" aria-hidden="true">
        {type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
      </span>
      {message}
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="ml-2 text-outline hover:text-on-surface transition-colors"
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          close
        </span>
      </button>
    </div>
  )
}
