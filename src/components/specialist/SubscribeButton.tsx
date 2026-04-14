'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface SubscribeButtonProps {
  specialistId: string
  specialistSlug: string
  subscriptionPrice: number
  isSubscribed?: boolean
}

export function SubscribeButton({
  specialistId,
  specialistSlug,
  subscriptionPrice,
  isSubscribed,
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)
  const { isSignedIn } = useUser()
  const router = useRouter()

  async function handleSubscribe() {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/${specialistSlug}`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialistId }),
      })
      const data = (await res.json()) as { url?: string }
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Subscribe error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <Button variant="secondary" className="w-full" disabled>
        <span
          className="material-symbols-outlined text-sm"
          aria-hidden="true"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        Subscribed
      </Button>
    )
  }

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      variant="white"
      className="w-full py-4 text-sm"
      size="lg"
      aria-label={`Subscribe for ${formatCurrency(subscriptionPrice)} per month`}
    >
      {loading ? (
        <>
          <span
            className="material-symbols-outlined text-sm animate-spin"
            aria-hidden="true"
          >
            progress_activity
          </span>
          Processing...
        </>
      ) : (
        `Subscribe — ${formatCurrency(subscriptionPrice)}/mo`
      )}
    </Button>
  )
}
