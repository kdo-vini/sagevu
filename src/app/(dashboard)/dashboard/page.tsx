import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

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

  const totalSubscribers = user.specialists.reduce(
    (sum, p) => sum + p._count.subscriptions,
    0
  )
  const totalPosts = user.specialists.reduce((sum, p) => sum + p._count.posts, 0)

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">
            Creator Dashboard
          </h1>
          <p className="text-outline mt-1">Manage your specialists and content</p>
        </div>
        <Link
          href="/dashboard/specialist/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            add
          </span>
          New Specialist
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {[
          {
            label: 'Total Specialists',
            value: user.specialists.length.toString(),
            icon: 'person',
          },
          {
            label: 'Active Subscribers',
            value: totalSubscribers.toString(),
            icon: 'group',
          },
          {
            label: 'Total Posts',
            value: totalPosts.toString(),
            icon: 'article',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container rounded-xl p-6 border border-outline-variant/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-primary"
                  aria-hidden="true"
                >
                  {stat.icon}
                </span>
              </div>
              <span className="text-outline text-sm">{stat.label}</span>
            </div>
            <div className="text-3xl font-black text-white tracking-tighter">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Specialists grid */}
      <div>
        <h2 className="text-white font-bold text-lg mb-4">Your Specialists</h2>

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
            {user.specialists.map((specialist) => (
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
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-bold text-base">
                        {specialist.name}
                      </h3>
                      {specialist.specialty && (
                        <p className="text-outline text-xs mt-0.5">
                          {specialist.specialty}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-white font-black">
                        {formatCurrency(specialist.subscriptionPrice)}
                      </div>
                      <div className="text-outline text-[10px]">/mo</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-outline">
                    <span className="flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-base"
                        aria-hidden="true"
                      >
                        group
                      </span>
                      {specialist._count.subscriptions}
                    </span>
                    <span className="flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-base"
                        aria-hidden="true"
                      >
                        article
                      </span>
                      {specialist._count.posts}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/${specialist.slug}`}
                      className="flex-1 text-center py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface-variant text-xs font-bold hover:bg-surface-variant transition-colors"
                    >
                      View
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
                      Post
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
