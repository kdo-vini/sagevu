'use client'
import { useState } from 'react'

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Could not open the billing portal. Please try again.')
        return
      }
      window.location.href = data.url
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          credit_card
        </span>
        {loading ? 'Opening portal...' : 'Manage Billing'}
      </button>
      {error && (
        <p className="text-red-400 text-xs mt-2">{error}</p>
      )}
    </div>
  )
}
