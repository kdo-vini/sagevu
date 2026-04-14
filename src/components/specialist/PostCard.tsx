import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { MediaCarousel } from '@/components/ui/MediaCarousel'
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

  // Separate images from video in mediaUrls
  const images = (post.mediaUrls ?? []).filter((u) => !u.match(/\.mp4(\?|$)/i))
  const videoUrl = (post.mediaUrls ?? []).find((u) => u.match(/\.mp4(\?|$)/i))

  return (
    <article className="group relative bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10 hover:border-outline-variant/30 transition-all duration-300">
      <div className="p-5 pb-4">
        {/* Author row */}
        <header className="flex items-center gap-3 mb-4">
          <Link
            href={slug ? `/${slug}` : '#'}
            className="flex-shrink-0 w-10 h-10 rounded-full border border-outline-variant/20 bg-surface-container-high overflow-hidden block"
            aria-hidden="true"
            tabIndex={-1}
          >
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-container/20">
                <span className="text-sm font-black text-primary">{name[0]}</span>
              </div>
            )}
          </Link>
          <div className="flex flex-col min-w-0">
            <Link
              href={slug ? `/${slug}` : '#'}
              className="text-white font-bold text-sm hover:text-primary transition-colors truncate"
            >
              {name}
            </Link>
            <time dateTime={post.createdAt} className="text-outline text-[11px]">
              {formatRelativeTime(new Date(post.createdAt))}
            </time>
          </div>
        </header>

        {/* Content */}
        {isLocked ? (
          <div className="relative min-h-[100px]">
            <div
              className="text-on-surface-variant text-sm blur-sm select-none line-clamp-4 leading-relaxed"
              aria-hidden="true"
            >
              {post.content}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div
                className="w-11 h-11 rounded-full bg-surface-container-highest flex items-center justify-center"
                aria-hidden="true"
              >
                <span
                  className="material-symbols-outlined text-primary text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lock
                </span>
              </div>
              <p className="text-white font-bold text-sm">Subscriber Content</p>
              {slug && (
                <Link
                  href={`/${slug}`}
                  className="text-primary text-xs font-bold hover:underline"
                >
                  Subscribe to unlock
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Rendered markdown */}
            <div className="text-on-surface-variant text-sm leading-relaxed mb-1">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-white text-lg font-black mb-2 mt-3 first:mt-0">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-white text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-white text-sm font-bold mb-1.5 mt-2 first:mt-0">{children}</h3>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-white font-bold">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="text-on-surface-variant italic">{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-2 space-y-1.5">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-2 space-y-1.5">{children}</ol>
                  ),
                  li: ({ children, ...props }) => {
                    const isOrdered = (props as { ordered?: boolean }).ordered
                    return (
                      <li className="flex gap-2 text-sm">
                        <span className="text-primary flex-shrink-0 font-bold leading-5">
                          {isOrdered ? '→' : '•'}
                        </span>
                        <span className="text-on-surface-variant">{children}</span>
                      </li>
                    )
                  },
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 text-on-surface-variant text-sm leading-relaxed">
                      {children}
                    </p>
                  ),
                  hr: () => <hr className="border-outline-variant/20 my-3" />,
                  code: ({ children }) => (
                    <code className="bg-surface-container-highest text-primary px-1.5 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-outline italic text-sm">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Media */}
            {(images.length > 0 || videoUrl) && (
              <MediaCarousel images={images} videoUrl={videoUrl} />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="px-5 py-3 bg-surface-container-low border-t border-outline-variant/5 flex items-center gap-4">
        <button
          className="flex items-center gap-1.5 text-outline text-sm hover:text-primary transition-colors duration-200"
          aria-label="Like post"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            favorite
          </span>
        </button>
        <button
          className="flex items-center gap-1.5 text-outline text-sm hover:text-on-surface transition-colors duration-200"
          aria-label="Comment on post"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            comment
          </span>
        </button>
        {slug && (
          <Link
            href={`/${slug}`}
            className="ml-auto flex items-center gap-1 text-outline text-xs hover:text-on-surface transition-colors"
            aria-label={`View ${name}'s profile`}
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>
        )}
      </footer>
    </article>
  )
}
