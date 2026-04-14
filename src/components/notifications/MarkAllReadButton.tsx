'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function MarkAllReadButton({ hasUnread }: { hasUnread: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleMarkAll() {
    setLoading(true)
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (!hasUnread) return null

  return (
    <button
      onClick={handleMarkAll}
      disabled={loading}
      className="text-sm text-primary font-bold hover:text-primary/80 transition-colors disabled:opacity-50"
    >
      {loading ? 'Marking...' : 'Mark all as read'}
    </button>
  )
}
