'use client'
import { PostCard } from './PostCard'
import type { Post, Persona } from '@/types'

interface PostFeedProps {
  posts: Post[]
  persona: Persona
  isSubscribed: boolean
}

export function PostFeed({ posts, persona, isSubscribed }: PostFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16" role="status" aria-label="No posts">
        <div
          className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-outline text-2xl">
            article
          </span>
        </div>
        <p className="text-outline">No posts yet.</p>
      </div>
    )
  }

  return (
    <section aria-label={`${persona.name}'s posts`}>
      <ol className="space-y-6 list-none">
        {posts.map((post) => {
          const isLocked = post.visibility === 'SUBSCRIBERS_ONLY' && !isSubscribed
          return (
            <li key={post.id}>
              <PostCard
                post={post}
                isLocked={isLocked}
                personaName={persona.name}
                personaAvatarUrl={persona.avatarUrl}
                personaSlug={persona.slug}
              />
            </li>
          )
        })}
      </ol>
    </section>
  )
}
