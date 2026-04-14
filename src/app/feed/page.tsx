import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { PostCard } from '@/components/specialist/PostCard'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/auth')
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    redirect('/auth')
  }

  // Get the user's active subscriptions for paywall logic
  const subscriptions = await prisma.subscription.findMany({
    where: {
      subscriberId: user.id,
      status: 'ACTIVE',
      currentPeriodEnd: { gt: new Date() },
    },
    select: { specialistId: true },
  })
  const subscribedIds = new Set(subscriptions.map((s) => s.specialistId))

  // Fetch ALL posts from published specialists — newest first
  const posts = await prisma.post.findMany({
    where: {
      specialist: { isPublished: true },
    },
    include: {
      specialist: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatarUrl: true,
          type: true,
          specialty: true,
          subscriptionPrice: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 60,
  })

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-20">
        <Sidebar />
        <main className="flex-1 lg:ml-72 min-h-screen pb-20 lg:pb-12">
          {/* Page header */}
          <div className="sticky top-20 z-10 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/10 px-6 py-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">For You</h1>
                <p className="text-outline text-xs mt-0.5">
                  Intelligence from across the platform
                </p>
              </div>
              <Link
                href="/discover"
                className="flex items-center gap-1.5 text-primary text-xs font-bold hover:text-primary/80 transition-colors"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  explore
                </span>
                Discover
              </Link>
            </div>
          </div>

          {/* Feed */}
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            {posts.length === 0 ? (
              <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-12 text-center mt-8">
                <div
                  className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4"
                  aria-hidden="true"
                >
                  <span className="material-symbols-outlined text-outline text-2xl">
                    rss_feed
                  </span>
                </div>
                <h3 className="text-white font-bold mb-2">Nothing here yet</h3>
                <p className="text-outline text-sm max-w-sm mx-auto mb-6">
                  Specialists haven&apos;t posted yet. Check back soon.
                </p>
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-surface-container-lowest font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  Discover Specialists
                </Link>
              </div>
            ) : (
              posts.map((post) => {
                const isOwner = false // owners don't browse the global feed as viewers
                const isSubscribed = subscribedIds.has(post.specialist.id)
                const isFree = post.specialist.subscriptionPrice === 0
                const isLocked =
                  post.visibility === 'SUBSCRIBERS_ONLY' && !isSubscribed && !isFree && !isOwner

                return (
                  <PostCard
                    key={post.id}
                    post={post as unknown as Parameters<typeof PostCard>[0]['post']}
                    isLocked={isLocked}
                    specialistName={post.specialist.name}
                    specialistAvatarUrl={post.specialist.avatarUrl}
                    specialistSlug={post.specialist.slug}
                  />
                )
              })
            )}

            {posts.length >= 60 && (
              <p className="text-center text-outline text-xs py-4">
                You&apos;ve reached the end — check back for new posts.
              </p>
            )}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
