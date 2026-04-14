import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { SpecialistProfile } from '@/components/specialist/SpecialistProfile'
import { prisma } from '@/lib/prisma'
import type { Specialist, Post } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  try {
    const specialist = await prisma.specialist.findUnique({ where: { slug } })
    if (!specialist) return { title: 'Not Found' }
    return {
      title: `${specialist.name} — Sagevu`,
      description:
        specialist.tagline ?? specialist.bio ?? `Follow ${specialist.name} on Sagevu`,
    }
  } catch {
    return { title: 'Sagevu' }
  }
}

export default async function SpecialistPage({ params }: PageProps) {
  const { slug } = await params
  
  // Prevent static file requests (e.g. favicon.ico, missing assets) from triggering auth()
  // As they bypass middleware, calling auth() on them crashes Clerk.
  if (slug.includes('.')) return notFound()
  
  const { userId } = await auth()

  let specialist
  try {
    specialist = await prisma.specialist.findUnique({
      where: { slug },
      include: {
        posts: { orderBy: { createdAt: 'desc' } },
      },
    })
  } catch {
    notFound()
  }

  if (!specialist || !specialist.isPublished) notFound()

  let isSubscribed = false
  let currentUserId: string | undefined

  if (userId) {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (user) {
      currentUserId = user.id

      // Owner always has access to their own specialist
      if (user.id === specialist.creatorId) {
        isSubscribed = true
      } else {
        const subscription = await prisma.subscription.findFirst({
          where: {
            subscriberId: user.id,
            specialistId: specialist.id,
            status: 'ACTIVE',
            currentPeriodEnd: { gt: new Date() },
          },
        })
        isSubscribed = !!subscription
      }
    }
  }

  const specialistData: Specialist = {
    id: specialist.id,
    creatorId: specialist.creatorId,
    name: specialist.name,
    slug: specialist.slug,
    bio: specialist.bio ?? null,
    avatarUrl: specialist.avatarUrl ?? null,
    coverUrl: specialist.coverUrl ?? null,
    type: specialist.type as 'HUMAN' | 'AI',
    specialty: specialist.specialty ?? null,
    tagline: specialist.tagline ?? null,
    isPublished: specialist.isPublished,
    subscriptionPrice: specialist.subscriptionPrice,
    currency: specialist.currency,
    stripePriceId: specialist.stripePriceId ?? null,
    createdAt: specialist.createdAt.toISOString(),
    updatedAt: specialist.updatedAt.toISOString(),
  }

  const posts: Post[] = specialist.posts.map((p) => ({
    id: p.id,
    specialistId: p.specialistId,
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
          <SpecialistProfile
            specialist={specialistData}
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
