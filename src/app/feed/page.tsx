import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { prisma } from '@/lib/prisma'
import { PostFeed } from '@/components/persona/PostFeed'
import type { Post, Persona } from '@/types'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    redirect('/sign-in')
  }

  // Find all active subscriptions for the user
  const subscriptions = await prisma.subscription.findMany({
    where: {
      subscriberId: user.id,
      status: 'ACTIVE',
      currentPeriodEnd: { gt: new Date() },
    },
    select: {
      personaId: true,
    },
  })

  const subscribedPersonaIds = subscriptions.map((s) => s.personaId)

  // Fetch posts from subscribed personas OR public posts from any published persona
  // Since it's an "Exclusive Feed", we prioritize subscribed content, but for discovery we can show public posts or just limit to what they follow.
  // We will show: posts from subscribed personas + public posts (optional depending on UX, let's keep it strictly 'feed' of followed persons for now to make "Exclusive" real)
  const posts = await prisma.post.findMany({
    where: {
      personaId: { in: subscribedPersonaIds },
      persona: { isPublished: true },
    },
    include: {
      persona: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatarUrl: true,
          coverUrl: true,
          tagline: true,
          type: true,
          specialty: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Group posts or pass directly? The PostFeed component expects an array of posts and a *single* persona prop currently.
  // Wait, let's check `PostFeed` component.
  // The existing `PostFeed` component is designed to render posts for a *single* persona profile.
  // For the global feed, we'll need to map over posts and render `<PostCard>` directly, because each post could have a different Persona.

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-20">
        <Sidebar />
        <main className="flex-1 lg:ml-72 min-h-screen px-6 py-12 pb-20 lg:pb-12 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-black tracking-tighter text-white mb-2">
              Exclusive Feed
            </h1>
            <p className="text-outline text-sm">
              The latest intelligence and content from your subscriptions.
            </p>
          </div>

          {/* Feed Content */}
          {posts.length === 0 ? (
            <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-12 text-center">
              <div
                className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <span className="material-symbols-outlined text-outline text-2xl">
                  rss_feed
                </span>
              </div>
              <h3 className="text-white font-bold mb-2">Your feed is quiet</h3>
              <p className="text-outline text-sm max-w-sm mx-auto mb-6">
                Subscribe to human and AI personas to see their exclusive content and analysis appear here.
              </p>
              <a 
                href="/discover"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-surface-container-lowest font-bold rounded-lg hover:bg-white/90 transition-colors text-sm"
              >
                Discover Personas
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => {
                // Since this is the exclusive feed, the user has a subscription to see these (checked via query above).
                // So no post is locked for them in this view.
                return (
                  <div key={post.id} className="mb-8">
                    {/* Tiny header showing who posted this to identify in a mixed feed */}
                    <div className="flex items-center gap-3 mb-3">
                      <a href={`/${post.persona.slug}`} className="relative w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/10">
                        {post.persona.avatarUrl ? (
                          <img src={post.persona.avatarUrl} alt={post.persona.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-container/20">
                            <span className="text-xs font-bold text-primary">{post.persona.name[0]}</span>
                          </div>
                        )}
                      </a>
                      <a href={`/${post.persona.slug}`} className="text-sm font-bold text-white hover:text-primary transition-colors">
                        {post.persona.name}
                      </a>
                      <span className="text-xs text-outline">•</span>
                      <span className="text-xs text-outline">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6">
                      <div className="prose-dark prose-sm sm:prose-base max-w-none mb-4 whitespace-pre-wrap">
                        {post.content}
                      </div>

                      {post.mediaUrls.length > 0 && (
                        <div
                          className={`grid gap-2 ${
                            post.mediaUrls.length === 1
                              ? 'grid-cols-1'
                              : post.mediaUrls.length === 2
                                ? 'grid-cols-2'
                                : 'grid-cols-2'
                          }`}
                        >
                          {post.mediaUrls.map((url, i) => (
                            <div
                              key={i}
                              className={`relative rounded-xl overflow-hidden bg-surface-container-high ${
                                post.mediaUrls.length === 3 && i === 0 ? 'col-span-2 aspect-video' : 'aspect-square'
                              }`}
                            >
                              <img src={url} alt="Media" className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
