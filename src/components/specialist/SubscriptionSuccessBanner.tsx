'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SubscriptionSuccessBannerProps {
  specialistSlug: string
}

export function SubscriptionSuccessBanner({ specialistSlug }: SubscriptionSuccessBannerProps) {
  const storageKey = `subscribed-banner-dismissed-${specialistSlug}`
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem(storageKey)) {
      setVisible(true)
    }
  }, [storageKey])

  function dismiss() {
    sessionStorage.setItem(storageKey, '1')
    setVisible(false)
  }

  function scrollToPosts() {
    dismiss()
    document.getElementById('posts-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-8 bg-primary/10 border border-primary/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
    >
      <span
        className="material-symbols-outlined text-primary text-3xl flex-shrink-0"
        aria-hidden="true"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        check_circle
      </span>

      <div className="flex-1">
        <p className="text-white font-bold mb-0.5">Subscription confirmed!</p>
        <p className="text-outline text-sm">
          You now have full access. Where would you like to start?
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        <Link
          href={`/${specialistSlug}/chat`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">chat</span>
          Send a message
        </Link>
        <button
          onClick={scrollToPosts}
          className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors"
        >
          View exclusive posts
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="p-2 text-outline hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
        </button>
      </div>
    </div>
  )
}
