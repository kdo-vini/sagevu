import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { DiscoverGrid } from '@/components/specialist/DiscoverGrid'
import { FeaturedSpecialists } from '@/components/specialist/FeaturedSpecialists'
import type { FeaturedSpecialist } from '@/components/specialist/FeaturedSpecialists'
import { prisma } from '@/lib/prisma'
import type { Specialist } from '@/types'

export const dynamic = 'force-dynamic'

async function getSpecialists(): Promise<Specialist[]> {
  try {
    const specialists = await prisma.specialist.findMany({
      where: { isPublished: true },
      include: { creator: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return specialists.map((p) => ({
      id: p.id,
      creatorId: p.creatorId,
      name: p.name,
      slug: p.slug,
      bio: p.bio ?? null,
      avatarUrl: p.avatarUrl ?? null,
      coverUrl: p.coverUrl ?? null,
      type: p.type as 'HUMAN' | 'AI',
      specialty: p.specialty ?? null,
      tagline: p.tagline ?? null,
      isPublished: p.isPublished,
      subscriptionPrice: p.subscriptionPrice,
      currency: p.currency,
      stripePriceId: p.stripePriceId ?? null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      creator: {
        name: p.creator.name ?? null,
        avatarUrl: p.creator.avatarUrl ?? null,
      },
    }))
  } catch {
    return []
  }
}

async function getFeaturedSpecialists(): Promise<FeaturedSpecialist[]> {
  try {
    const specialists = await prisma.specialist.findMany({
      where: { isPublished: true },
      include: {
        _count: { select: { subscriptions: true } },
        creator: { select: { name: true } },
      },
      orderBy: { subscriptions: { _count: 'desc' } },
      take: 3,
    })

    return specialists.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      specialty: s.specialty ?? null,
      tagline: s.tagline ?? null,
      avatarUrl: s.avatarUrl ?? null,
      coverUrl: s.coverUrl ?? null,
      type: s.type as 'HUMAN' | 'AI',
      subscriptionPrice: s.subscriptionPrice,
      subscriberCount: s._count.subscriptions,
    }))
  } catch {
    return []
  }
}

export default async function DiscoverPage() {
  const [specialists, featured] = await Promise.all([
    getSpecialists(),
    getFeaturedSpecialists(),
  ])

  const total = specialists.length
  const aiCount = specialists.filter((p) => p.type === 'AI').length
  const humanCount = specialists.filter((p) => p.type === 'HUMAN').length

  // Build subscriber count map for grid cards
  const subscriberCounts: Record<string, number> = {}
  for (const f of featured) {
    subscriberCounts[f.id] = f.subscriberCount
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-20">
        <Sidebar />
        <main className="flex-1 lg:ml-72 min-h-screen px-6 lg:px-12 py-12 pb-20 lg:pb-12">
          {/* Hero section */}
          <section className="max-w-6xl mx-auto mb-16">
            <div className="text-center mb-12">
              <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-white mb-4 leading-none">
                Expert Intelligence,
                <br />
                <span className="gradient-text-purple">On Demand</span>
              </h1>

              {/* Specialist count line */}
              <p className="text-on-surface-variant text-lg max-w-xl mx-auto mb-2">
                {total > 0 ? (
                  <>
                    Discover{' '}
                    <span className="text-white font-bold">{total}</span>{' '}
                    specialist{total !== 1 ? 's' : ''} on Sagevu. Subscribe to
                    AI and human experts for exclusive content and direct access.
                  </>
                ) : (
                  'Be the first to create a specialist on Sagevu and start sharing your expertise.'
                )}
              </p>
            </div>

            {/* Stats bar */}
            <div className="flex items-center justify-center gap-12 py-6 border-y border-outline-variant/20">
              {[
                { label: 'Expert Specialists', value: total.toString() },
                { label: 'AI Powered', value: aiCount.toString() },
                { label: 'Human Experts', value: humanCount.toString() },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-black text-white tracking-tighter">
                    {stat.value}
                  </div>
                  <div className="text-outline text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Featured specialists */}
          {featured.length > 0 && (
            <FeaturedSpecialists specialists={featured} />
          )}

          {/* Full grid with search + filters */}
          <DiscoverGrid specialists={specialists} subscriberCounts={subscriberCounts} />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
