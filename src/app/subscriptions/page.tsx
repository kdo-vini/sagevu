import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { BillingPortalButton } from '@/components/subscriptions/BillingPortalButton'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import type { SubscriptionStatus } from '@/types'

export const dynamic = 'force-dynamic'

const statusConfig: Record<
  SubscriptionStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-green-500/10 text-green-400 border border-green-500/20',
  },
  CANCELED: {
    label: 'Canceled',
    className: 'bg-red-500/10 text-red-400 border border-red-500/20',
  },
  PAST_DUE: {
    label: 'Past Due',
    className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
  INCOMPLETE: {
    label: 'Incomplete',
    className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
}

export default async function SubscriptionsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/auth')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) redirect('/auth')

  const subscriptions = await prisma.subscription.findMany({
    where: { subscriberId: user.id },
    include: {
      specialist: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatarUrl: true,
          type: true,
          specialty: true,
          tagline: true,
          subscriptionPrice: true,
          currency: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const active = subscriptions.filter(
    (s) => s.status === 'ACTIVE' && s.currentPeriodEnd > new Date()
  )
  const inactive = subscriptions.filter(
    (s) => !(s.status === 'ACTIVE' && s.currentPeriodEnd > new Date())
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-20">
        <Sidebar />
        <main className="flex-1 lg:ml-72 min-h-screen px-6 py-12 pb-20 lg:pb-12 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-white mb-2">
                  My Subscriptions
                </h1>
                <p className="text-outline text-sm">
                  Manage the specialists you subscribe to.
                </p>
              </div>
              {active.length > 0 && <BillingPortalButton />}
            </div>
          </div>

          {subscriptions.length === 0 ? (
            /* Empty state */
            <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-12 text-center">
              <div
                className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <span className="material-symbols-outlined text-outline text-2xl">
                  auto_awesome
                </span>
              </div>
              <h3 className="text-white font-bold mb-2">No subscriptions yet</h3>
              <p className="text-outline text-sm max-w-sm mx-auto mb-6">
                Subscribe to AI and human specialists to unlock exclusive content and direct access.
              </p>
              <Link
                href="/discover"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-surface-container-lowest font-bold rounded-lg hover:bg-white/90 transition-colors text-sm"
              >
                Discover Specialists
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Active subscriptions */}
              {active.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">
                    Active ({active.length})
                  </h2>
                  <div className="space-y-3">
                    {active.map((sub) => (
                      <SubscriptionCard key={sub.id} sub={sub} />
                    ))}
                  </div>
                </section>
              )}

              {/* Inactive subscriptions */}
              {inactive.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">
                    Inactive ({inactive.length})
                  </h2>
                  <div className="space-y-3">
                    {inactive.map((sub) => (
                      <SubscriptionCard key={sub.id} sub={sub} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}

type SubWithSpecialist = Awaited<
  ReturnType<typeof prisma.subscription.findMany>
>[number] & {
  specialist: {
    id: string
    name: string
    slug: string
    avatarUrl: string | null
    type: string
    specialty: string | null
    tagline: string | null
    subscriptionPrice: number
    currency: string
  }
}

function SubscriptionCard({ sub }: { sub: SubWithSpecialist }) {
  const status = sub.status as SubscriptionStatus
  const { label, className } = statusConfig[status] ?? statusConfig.INCOMPLETE
  const isActive = status === 'ACTIVE' && sub.currentPeriodEnd > new Date()
  const renewalLabel = isActive ? 'Renews' : 'Expired'

  return (
    <article className="bg-surface-container border border-outline-variant/10 rounded-2xl p-5 flex items-center gap-4">
      {/* Avatar */}
      <div className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-surface-container-high">
        {sub.specialist.avatarUrl ? (
          <img
            src={sub.specialist.avatarUrl}
            alt={sub.specialist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-container/20">
            <span className="text-lg font-black text-primary" aria-hidden="true">
              {sub.specialist.name[0]}
            </span>
          </div>
        )}
        {sub.specialist.type === 'AI' && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-surface-container"
            title="AI Specialist"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/${sub.specialist.slug}`}
            className="text-white font-bold text-sm hover:text-primary transition-colors truncate"
          >
            {sub.specialist.name}
          </Link>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}
          >
            {label}
          </span>
        </div>

        <p className="text-outline text-xs mt-0.5 truncate">
          {sub.specialist.specialty ?? sub.specialist.tagline ?? 'Specialist'}
        </p>

        <div className="flex items-center gap-3 mt-1.5 text-xs text-outline">
          <span>
            {formatCurrency(sub.specialist.subscriptionPrice, sub.specialist.currency)}/mo
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {renewalLabel}{' '}
            {formatRelativeTime(sub.currentPeriodEnd)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isActive && (
          <Link
            href={`/${sub.specialist.slug}/chat`}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-container-high hover:bg-primary/20 transition-colors"
            aria-label={`Chat with ${sub.specialist.name}`}
            title="Chat"
          >
            <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">
              chat_bubble
            </span>
          </Link>
        )}
        <Link
          href={`/${sub.specialist.slug}`}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-container-high hover:bg-surface-variant transition-colors"
          aria-label={`View ${sub.specialist.name}'s profile`}
          title="View profile"
        >
          <span className="material-symbols-outlined text-outline text-lg" aria-hidden="true">
            arrow_forward
          </span>
        </Link>
      </div>
    </article>
  )
}
