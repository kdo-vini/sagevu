import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// ─── Stat card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string
  label: string
  value: string
  accent?: boolean
}

function StatCard({ icon, label, value, accent = false }: StatCardProps) {
  return (
    <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            accent ? 'bg-primary/20' : 'bg-primary/10'
          }`}
        >
          <span
            className={`material-symbols-outlined ${accent ? 'text-primary' : 'text-primary'}`}
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        <span className="text-outline text-sm">{label}</span>
      </div>
      <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

type SubStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'INCOMPLETE'

const STATUS_STYLES: Record<SubStatus, string> = {
  ACTIVE: 'bg-green-500/15 text-green-400 border border-green-500/25',
  CANCELED: 'bg-red-500/15 text-red-400 border border-red-500/25',
  PAST_DUE: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  INCOMPLETE: 'bg-outline/15 text-outline border border-outline/25',
}

const STATUS_LABELS: Record<SubStatus, string> = {
  ACTIVE: 'Active',
  CANCELED: 'Canceled',
  PAST_DUE: 'Past Due',
  INCOMPLETE: 'Incomplete',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      specialists: {
        include: {
          _count: {
            select: {
              subscriptions: { where: { status: 'ACTIVE' } },
              posts: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) redirect('/sign-in')

  // Recent subscriptions across all user's specialists
  const recentSubscriptions = await prisma.subscription.findMany({
    where: {
      specialist: { creatorId: user.id },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      subscriber: true,
      specialist: true,
    },
  })

  // Aggregate stats
  const totalSubscribers = user.specialists.reduce(
    (sum, s) => sum + s._count.subscriptions,
    0
  )
  const totalPosts = user.specialists.reduce((sum, s) => sum + s._count.posts, 0)

  // Monthly revenue = sum of (activeSubscriberCount × subscriptionPrice) per specialist
  const monthlyRevenueCents = user.specialists.reduce(
    (sum, s) => sum + s._count.subscriptions * s.subscriptionPrice,
    0
  )
  const earningsCents = Math.floor(monthlyRevenueCents * 0.85)

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white">
            Creator Dashboard
          </h1>
          <p className="text-outline mt-1 text-sm md:text-base">
            Manage your specialists and content
          </p>
        </div>
        <Link
          href="/dashboard/specialist/new"
          className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            add
          </span>
          New Specialist
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon="group" label="Total Subscribers" value={totalSubscribers.toString()} />
        <StatCard
          icon="payments"
          label="Monthly Revenue"
          value={formatCurrency(monthlyRevenueCents)}
        />
        <StatCard
          icon="account_balance_wallet"
          label="Your Earnings (85%)"
          value={formatCurrency(earningsCents)}
          accent
        />
        <StatCard icon="article" label="Total Posts" value={totalPosts.toString()} />
      </div>

      {/* Specialists grid */}
      <section aria-labelledby="specialists-heading" className="mb-10">
        <h2 id="specialists-heading" className="text-white font-bold text-lg mb-4">
          Your Specialists
        </h2>

        {user.specialists.length === 0 ? (
          <div className="text-center py-16 bg-surface-container rounded-xl border border-outline-variant/10">
            <span
              className="material-symbols-outlined text-outline text-4xl mb-4 block"
              aria-hidden="true"
            >
              person_add
            </span>
            <h3 className="text-white font-bold mb-2">No specialists yet</h3>
            <p className="text-outline text-sm mb-6">
              Create your first expert specialist to start earning.
            </p>
            <Link
              href="/dashboard/specialist/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                add
              </span>
              Create Specialist
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.specialists.map((specialist) => {
              const specialistRevenueCents =
                specialist._count.subscriptions * specialist.subscriptionPrice
              return (
                <article
                  key={specialist.id}
                  className="bg-surface-container rounded-xl border border-outline-variant/10 overflow-hidden hover:border-outline-variant/30 transition-colors"
                >
                  {/* Cover */}
                  <div className="relative h-24 bg-surface-container-high">
                    {specialist.coverUrl && (
                      <Image
                        src={specialist.coverUrl}
                        alt=""
                        fill
                        className="object-cover opacity-50"
                        aria-hidden="true"
                      />
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span
                        className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                          specialist.isPublished
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-highest text-outline border border-outline-variant/20'
                        }`}
                      >
                        {specialist.isPublished ? 'Live' : 'Draft'}
                      </span>
                      <span className="text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest bg-surface-container-highest text-outline border border-outline-variant/20">
                        {specialist.type}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="min-w-0">
                        <h3 className="text-white font-bold text-base truncate">
                          {specialist.name}
                        </h3>
                        {specialist.specialty && (
                          <p className="text-outline text-xs mt-0.5 truncate">
                            {specialist.specialty}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-white font-black text-sm">
                          {formatCurrency(specialist.subscriptionPrice)}
                        </div>
                        <div className="text-outline text-[10px]">/mo</div>
                      </div>
                    </div>

                    {/* Mini stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-outline">
                      <Link
                        href={`/dashboard/specialist/${specialist.id}/subscribers`}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        title="View subscribers"
                      >
                        <span
                          className="material-symbols-outlined text-base"
                          aria-hidden="true"
                        >
                          group
                        </span>
                        <span>
                          {specialist._count.subscriptions}{' '}
                          <span className="sr-only">subscribers</span>
                        </span>
                      </Link>
                      <span className="flex items-center gap-1">
                        <span
                          className="material-symbols-outlined text-base"
                          aria-hidden="true"
                        >
                          article
                        </span>
                        <span>
                          {specialist._count.posts}{' '}
                          <span className="sr-only">posts</span>
                        </span>
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <span
                          className="material-symbols-outlined text-base"
                          aria-hidden="true"
                        >
                          payments
                        </span>
                        <span>{formatCurrency(specialistRevenueCents)}/mo</span>
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/${specialist.slug}`}
                        className="flex-1 text-center py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface-variant text-xs font-bold hover:bg-surface-variant transition-colors"
                      >
                        View Live
                      </Link>
                      <Link
                        href={`/dashboard/specialist/${specialist.id}/edit`}
                        className="flex-1 text-center py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface-variant text-xs font-bold hover:bg-surface-variant transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/dashboard/specialist/${specialist.id}/posts/new`}
                        className="flex-1 text-center py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                      >
                        New Post
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Recent activity */}
      <section aria-labelledby="activity-heading">
        <h2 id="activity-heading" className="text-white font-bold text-lg mb-4">
          Recent Activity
        </h2>
        <div className="bg-surface-container rounded-xl border border-outline-variant/10 divide-y divide-outline-variant/10">
          {recentSubscriptions.length === 0 ? (
            <div className="py-12 text-center">
              <span
                className="material-symbols-outlined text-outline text-3xl mb-3 block"
                aria-hidden="true"
              >
                notifications_none
              </span>
              <p className="text-outline text-sm">No subscriber activity yet.</p>
              <p className="text-outline text-xs mt-1">
                Share your specialist profile to attract your first subscriber.
              </p>
            </div>
          ) : (
            recentSubscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center gap-4 px-5 py-4">
                {/* Avatar placeholder */}
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {sub.subscriber.avatarUrl ? (
                    <Image
                      src={sub.subscriber.avatarUrl}
                      alt=""
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
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

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">
                    <span className="font-bold">{sub.subscriber.name ?? sub.subscriber.email}</span>
                    {' subscribed to '}
                    <Link
                      href={`/${sub.specialist.slug}`}
                      className="text-primary font-bold hover:underline"
                    >
                      {sub.specialist.name}
                    </Link>
                  </p>
                  <p className="text-outline text-xs mt-0.5">
                    {formatRelativeTime(sub.createdAt)}
                  </p>
                </div>

                {/* Status badge */}
                <span
                  className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[sub.status as SubStatus]}`}
                >
                  {STATUS_LABELS[sub.status as SubStatus]}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
