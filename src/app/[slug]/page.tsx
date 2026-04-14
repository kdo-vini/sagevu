import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { PersonaProfile } from '@/components/persona/PersonaProfile'
import { prisma } from '@/lib/prisma'
import type { Persona, Post } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  try {
    const persona = await prisma.persona.findUnique({ where: { slug } })
    if (!persona) return { title: 'Not Found' }
    return {
      title: `${persona.name} — Sagevu`,
      description:
        persona.tagline ?? persona.bio ?? `Follow ${persona.name} on Sagevu`,
    }
  } catch {
    return { title: 'Sagevu' }
  }
}

export default async function PersonaPage({ params }: PageProps) {
  const { slug } = await params
  
  // Prevent static file requests (e.g. favicon.ico, missing assets) from triggering auth()
  // As they bypass middleware, calling auth() on them crashes Clerk.
  if (slug.includes('.')) return notFound()
  
  const { userId } = await auth()

  let persona
  try {
    persona = await prisma.persona.findUnique({
      where: { slug },
      include: {
        posts: { orderBy: { createdAt: 'desc' } },
      },
    })
  } catch {
    notFound()
  }

  if (!persona || !persona.isPublished) notFound()

  let isSubscribed = false
  let currentUserId: string | undefined

  if (userId) {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (user) {
      currentUserId = user.id

      // Owner always has access to their own persona
      if (user.id === persona.creatorId) {
        isSubscribed = true
      } else {
        const subscription = await prisma.subscription.findFirst({
          where: {
            subscriberId: user.id,
            personaId: persona.id,
            status: 'ACTIVE',
            currentPeriodEnd: { gt: new Date() },
          },
        })
        isSubscribed = !!subscription
      }
    }
  }

  const personaData: Persona = {
    id: persona.id,
    creatorId: persona.creatorId,
    name: persona.name,
    slug: persona.slug,
    bio: persona.bio ?? null,
    avatarUrl: persona.avatarUrl ?? null,
    coverUrl: persona.coverUrl ?? null,
    type: persona.type as 'HUMAN' | 'AI',
    specialty: persona.specialty ?? null,
    tagline: persona.tagline ?? null,
    isPublished: persona.isPublished,
    subscriptionPrice: persona.subscriptionPrice,
    currency: persona.currency,
    stripePriceId: persona.stripePriceId ?? null,
    createdAt: persona.createdAt.toISOString(),
    updatedAt: persona.updatedAt.toISOString(),
  }

  const posts: Post[] = persona.posts.map((p) => ({
    id: p.id,
    personaId: p.personaId,
    content: p.content,
    mediaUrls: p.mediaUrls,
    visibility: p.visibility as 'PUBLIC' | 'SUBSCRIBERS_ONLY',
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-20">
        <Sidebar />
        <main className="flex-1 lg:ml-72 min-h-screen px-6 lg:px-12 py-12 pb-20 lg:pb-12">
          <PersonaProfile
            persona={personaData}
            posts={posts}
            isSubscribed={isSubscribed}
            currentUserId={currentUserId}
          />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
