import Link from 'next/link'
import Image from 'next/image'
import { SpecialistBadge } from './SpecialistBadge'
import { formatCurrency } from '@/lib/utils'

export interface FeaturedSpecialist {
  id: string
  name: string
  slug: string
  specialty: string | null
  tagline: string | null
  avatarUrl: string | null
  coverUrl: string | null
  type: 'HUMAN' | 'AI'
  subscriptionPrice: number
  subscriberCount: number
}

interface FeaturedSpecialistsProps {
  specialists: FeaturedSpecialist[]
}

export function FeaturedSpecialists({ specialists }: FeaturedSpecialistsProps) {
  if (specialists.length === 0) return null

  return (
    <section className="max-w-6xl mx-auto mb-16" aria-label="Featured specialists">
      <div className="flex items-center gap-3 mb-6">
        <span
          className="material-symbols-outlined text-primary text-2xl"
          aria-hidden="true"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
        <h2 className="text-white text-2xl font-black tracking-tight">
          Featured Specialists
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {specialists.map((specialist) => (
          <FeaturedCard key={specialist.id} specialist={specialist} />
        ))}
      </div>
    </section>
  )
}

function FeaturedCard({ specialist }: { specialist: FeaturedSpecialist }) {
  const isFree = specialist.subscriptionPrice === 0

  return (
    <Link
      href={`/${specialist.slug}`}
      className="block group"
      aria-label={`View ${specialist.name}'s profile — ${specialist.specialty ?? 'Specialist'}`}
    >
      <article className="relative rounded-2xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all duration-200 hover:shadow-[0_16px_40px_-12px_rgba(108,99,255,0.3)] min-h-[220px] flex flex-col justify-end">
        {/* Background: cover image or gradient */}
        <div className="absolute inset-0" aria-hidden="true">
          {specialist.coverUrl ? (
            <>
              <Image
                src={specialist.coverUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Blur + darken overlay */}
              <div className="absolute inset-0 backdrop-blur-[2px] bg-surface-container/60" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-surface-container to-surface-container-high" />
          )}
          {/* Bottom scrim for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/70 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-5 flex flex-col gap-3">
          {/* Avatar row */}
          <div className="flex items-end gap-3">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-xl border-2 border-outline-variant/30 overflow-hidden bg-surface-container-high">
                {specialist.avatarUrl ? (
                  <Image
                    src={specialist.avatarUrl}
                    alt={specialist.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary-container/20">
                    <span className="text-2xl font-black text-primary" aria-hidden="true">
                      {specialist.name[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
                <SpecialistBadge type={specialist.type} size="sm" />
              </div>
            </div>

            {/* Subscriber count pill */}
            <div className="ml-auto flex items-center gap-1 bg-surface-container/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-on-surface-variant border border-outline-variant/20">
              <span
                className="material-symbols-outlined text-[13px]"
                aria-hidden="true"
              >
                group
              </span>
              <span>
                {specialist.subscriberCount > 0
                  ? specialist.subscriberCount.toLocaleString()
                  : '0'}{' '}
                subscriber{specialist.subscriberCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Text */}
          <div>
            <h3 className="text-white font-black text-lg tracking-tight leading-tight group-hover:text-primary transition-colors duration-200">
              {specialist.name}
            </h3>
            {specialist.specialty && (
              <p className="text-primary/80 text-xs font-semibold mb-1 uppercase tracking-wider">
                {specialist.specialty}
              </p>
            )}
            {specialist.tagline && (
              <p className="text-on-surface-variant text-sm line-clamp-2">
                {specialist.tagline}
              </p>
            )}
          </div>

          {/* CTA row */}
          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm group-hover:opacity-90 transition-opacity">
              <span
                className="material-symbols-outlined text-[15px]"
                aria-hidden="true"
              >
                open_in_new
              </span>
              View Profile
            </span>

            <div className="text-right">
              {isFree ? (
                <span className="text-emerald-400 font-bold text-sm">Free</span>
              ) : (
                <div>
                  <span className="text-white font-black">
                    {formatCurrency(specialist.subscriptionPrice)}
                  </span>
                  <span className="text-outline text-xs">/mo</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
