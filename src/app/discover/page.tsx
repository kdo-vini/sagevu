import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { DiscoverGrid } from '@/components/persona/DiscoverGrid'
import { prisma } from '@/lib/prisma'
import type { Persona } from '@/types'

export const dynamic = 'force-dynamic'

async function getPersonas(): Promise<Persona[]> {
  try {
    const personas = await prisma.persona.findMany({
      where: { isPublished: true },
      include: { creator: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return personas.map((p) => ({
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

export default async function DiscoverPage() {
  const personas = await getPersonas()

  const aiCount = personas.filter((p) => p.type === 'AI').length
  const humanCount = personas.filter((p) => p.type === 'HUMAN').length

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
                <span className="gradient-text-purple">
                  On Demand
                </span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
                Subscribe to AI and human expert personas. Get exclusive
                content, direct messaging, and unparalleled access.
              </p>
            </div>

            {/* Stats bar */}
            <div className="flex items-center justify-center gap-12 py-6 border-y border-outline-variant/20">
              {[
                { label: 'Expert Personas', value: personas.length.toString() },
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

          <DiscoverGrid personas={personas} />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
