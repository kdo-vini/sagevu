import Image from 'next/image'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
  isLocked?: boolean
  specialistName?: string
  specialistAvatarUrl?: string | null
  specialistSlug?: string
}

export function PostCard({
  post,
  isLocked = false,
  specialistName,
  specialistAvatarUrl,
  specialistSlug,
}: PostCardProps) {
  const name = specialistName ?? post.specialist?.name ?? 'Unknown'
  const avatar = specialistAvatarUrl ?? post.specialist?.avatarUrl
  const slug = specialistSlug ?? post.specialist?.slug

  return (
    <article className="group relative bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10 hover:border-outline-variant/30 transition-all duration-300">
      <div className="p-6 pb-4">
        {/* Author row */}
        <header className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-full border border-outline-variant/20 bg-surface-container-high overflow-hidden flex-shrink-0"
            aria-hidden="true"
          >
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-container/20">
                <span className="text-xs font-black text-primary">{name[0]}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm">{name}</span>
            <time
              dateTime={post.createdAt}
              className="text-outline text-[10px]"
            >
              {formatRelativeTime(new Date(post.createdAt))}
            </time>
          </div>
        </header>

        {/* Content */}
        {isLocked ? (
          <div className="relative min-h-[80px]">
            <p
              className="text-on-surface-variant text-sm blur-sm select-none line-clamp-3"
              aria-hidden="true"
            >
              {post.content}
            </p>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-2"
                aria-hidden="true"
              >
                <span
                  className="material-symbols-outlined text-primary text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lock
                </span>
              </div>
              <p className="text-white font-bold text-sm">Subscriber Content</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
              {post.content}
            </p>
            {post.mediaUrls?.length > 0 && (
              <div
                className={`grid gap-2 mb-4 ${
                  post.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                }`}
              >
                {post.mediaUrls.map((url, i) => (
                  <div
                    key={i}
                    className="relative rounded-lg overflow-hidden aspect-video bg-surface-container-high"
                  >
                    <Image src={url} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="px-6 py-3 bg-surface-container-low border-t border-outline-variant/5 flex items-center gap-4">
        <button
          className="flex items-center gap-2 text-outline text-sm hover:text-primary transition-colors duration-200"
          aria-label="Like post"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            favorite
          </span>
        </button>
        <button
          className="flex items-center gap-2 text-outline text-sm hover:text-on-surface transition-colors duration-200"
          aria-label="Comment on post"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            comment
          </span>
        </button>
        <div className="ml-auto">
          {isLocked && slug && (
            <Link
              href={`/${slug}`}
              className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
              aria-label="Unlock subscriber content"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                visibility_off
              </span>
              Unlock
            </Link>
          )}
        </div>
      </footer>
    </article>
  )
}
