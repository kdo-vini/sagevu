'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'sagevu_off_platform_banner_dismissed'

export function OffPlatformBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY)
      if (!dismissed) {
        setVisible(true)
      }
    } catch {
      // localStorage may be unavailable in certain contexts; silently skip
    }
  }, [])

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="note"
      aria-label="Platform communication policy"
      className="flex items-start gap-3 px-4 py-3 border-b border-outline-variant/10 bg-surface-container"
    >
      <span
        className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0"
        style={{ fontSize: '16px' }}
        aria-hidden="true"
      >
        shield
      </span>

      <p className="flex-1 text-xs text-on-surface-variant leading-relaxed">
        All communication must stay on Sagevu. Sharing personal contact info
        or attempting to redirect conversations off-platform is strictly
        prohibited.{' '}
        <Link
          href="/terms#off-platform"
          className="text-primary hover:underline focus-visible:outline-none focus-visible:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
        </Link>
      </p>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss communication policy notice"
        className="shrink-0 flex items-center justify-center w-6 h-6 rounded text-outline hover:text-white hover:bg-surface-container-high transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '16px' }}
          aria-hidden="true"
        >
          close
        </span>
      </button>
    </div>
  )
}
