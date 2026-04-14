import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatRelativeTime } from '@/lib/utils'
import type { SubscriptionStatus } from '@/types'

export const dynamic = 'force-dynamic'

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  ACTIVE: 'bg-green-500/15 text-green-400 border border-green-500/25',
  CANCELED: 'bg-red-500/15 text-red-400 border border-red-500/25',
  PAST_DUE: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  INCOMPLETE: 'bg-outline/15 text-outline border border-outline/25',
}

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: 'Active',
  CANCELED: 'Canceled',
  PAST_DUE: 'Past Due',
  INCOMPLETE: 'Incomplete',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ specialistId: string }>
}

export default async function SubscribersPage({ params }: PageProps) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { specialistId } = await params

  // Resolve Clerk userId → internal user
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  })
  if (!user) redirect('/sign-in')

  // Verify the specialist exists and belongs to this creator
  const specialist = await prisma.specialist.findUnique({
    where: { id: specialistId },
    select: {
      id: true,
      name: true,
      slug: true,
      creatorId: true,
      subscriptionPrice: true,
    },
  })

  if (!specialist || specialist.creatorId !== user.id) notFound()

  // Fetch all subscriptions for this specialist
  const subscriptions = await prisma.subscription.findMany({
    where: { specialistId },
    include: {
      subscriber: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const activeCount = subscriptions.filter((s) => s.status === 'ACTIVE').length

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* Breadcrumb + header */}
      <nav className="flex items-center gap-2 text-sm text-outline mb-6" aria-label="Breadcrumb">
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          chevron_right
        </span>
        <Link
          href={`/dashboard/specialist/${specialistId}/edit`}
          className="hover:text-white transition-colors"
        >
          {specialist.name}
        </Link>
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          chevron_right
        </span>
        <span className="text-white">Subscribers</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white">
            Subscribers
          </h1>
          <p className="text-outline mt-1 text-sm">
            {specialist.name} &mdash;{' '}
            <span className="text-primary font-semibold">{activeCount} active</span>
            {subscriptions.length !== activeCount && (
              <> of {subscriptions.length} total</>
            )}
          </p>
        </div>
        <Link
          href={`/${specialist.slug}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface-variant text-sm font-bold hover:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            open_in_new
          </span>
          View Live
        </Link>
      </div>

      {subscriptions.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20 bg-surface-container rounded-xl border border-outline-variant/10">
          <span
            className="material-symbols-outlined text-outline text-5xl mb-4 block"
            aria-hidden="true"
          >
            group_off
          </span>
          <h3 className="text-white font-bold text-lg mb-2">No subscribers yet</h3>
          <p className="text-outline text-sm max-w-sm mx-auto">
            Share your specialist profile to get your first subscriber.
          </p>
          <Link
            href={`/${specialist.slug}`}
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              share
            </span>
            Share Profile
          </Link>
        </div>
      ) : (
        /* Subscriber table */
        <div className="bg-surface-container rounded-xl border border-outline-variant/10 overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-outline-variant/10">
            <span className="text-outline text-xs font-bold uppercase tracking-widest">
              Subscriber
            </span>
            <span className="text-outline text-xs font-bold uppercase tracking-widest">
              Status
            </span>
            <span className="text-outline text-xs font-bold uppercase tracking-widest">
              Subscribed
            </span>
            <span className="text-outline text-xs font-bold uppercase tracking-widest text-right">
              Renews
            </span>
          </div>

          <ul role="list" className="divide-y divide-outline-variant/10">
            {subscriptions.map((sub) => (
              <li
                key={sub.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-2 md:gap-4 items-center px-5 py-4"
              >
                {/* Subscriber info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {sub.subscriber.avatarUrl ? (
                      <Image
                        src={sub.subscriber.avatarUrl}
                        alt=""
                        width={36}
                        height={36}
                        className="object-cover"
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        className="material-symbols-outlined text-primary text-base"
                        aria-hidden="true"
                      >
                        person
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">
                      {sub.subscriber.name ?? '—'}
                    </p>
                    <p className="text-outline text-xs truncate">{sub.subscriber.email}</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span className="md:hidden text-outline text-xs mr-1">Status:</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[sub.status as SubscriptionStatus]}`}
                  >
                    {STATUS_LABELS[sub.status as SubscriptionStatus]}
                  </span>
                </div>

                {/* Subscribed date */}
                <div>
                  <span className="md:hidden text-outline text-xs mr-1">Subscribed:</span>
                  <span className="text-outline text-sm">
                    {formatRelativeTime(sub.createdAt)}
                  </span>
                </div>

                {/* Current period end */}
                <div className="md:text-right">
                  <span className="md:hidden text-outline text-xs mr-1">Renews:</span>
                  <span
                    className={`text-sm ${
                      sub.status === 'ACTIVE' ? 'text-white' : 'text-outline'
                    }`}
                  >
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(sub.currentPeriodEnd)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
