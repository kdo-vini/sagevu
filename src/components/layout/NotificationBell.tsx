'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

export function NotificationBell() {
  const { isSignedIn } = useUser()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isSignedIn) {
      setUnreadCount(0)
      return
    }

    let cancelled = false

    async function fetchUnreadCount() {
      try {
        const res = await fetch('/api/notifications?unread=true', {
          // Only send credentials; no body needed for GET
          method: 'GET',
        })
        if (!res.ok) return
        const data = (await res.json()) as { unreadCount: number }
        if (!cancelled) {
          setUnreadCount(data.unreadCount)
        }
      } catch (err) {
        console.error('[NotificationBell] Failed to fetch unread count:', err)
      }
    }

    void fetchUnreadCount()

    return () => {
      cancelled = true
    }
  }, [isSignedIn])

  const cappedCount = unreadCount > 99 ? 99 : unreadCount

  return (
    <Link
      href="/notifications"
      aria-label={
        unreadCount > 0
          ? `Notifications — ${cappedCount} unread`
          : 'Notifications'
      }
      className="relative flex items-center justify-center min-w-[44px] min-h-[44px] text-outline hover:text-white transition-colors"
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        notifications
      </span>
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none"
        >
          {cappedCount}
        </span>
      )}
    </Link>
  )
}
