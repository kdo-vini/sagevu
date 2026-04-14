import Link from 'next/link'
import Image from 'next/image'
import { SpecialistBadge } from './SpecialistBadge'
import { formatCurrency } from '@/lib/utils'
import type { Specialist } from '@/types'

interface SpecialistCardProps {
  specialist: Specialist
  subscriberCount?: number
}

export function SpecialistCard({ specialist, subscriberCount }: SpecialistCardProps) {
  const isFree = specialist.subscriptionPrice === 0

  return (
    <Link
      href={`/${specialist.slug}`}
      className="block group"
      aria-label={`View ${specialist.name}'s profile`}
    >
      <article className="bg-surface-container border border-outline-variant/10 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-200 hover:shadow-[0_10px_30px_-10px_rgba(108,99,255,0.2)]">
        {/* Cover image */}
        <div className="relative h-32 bg-gradient-to-br from-surface-container-high to-surface-container-highest">
          {specialist.coverUrl && (
            <Image
              src={specialist.coverUrl}
              alt=""
              fill
              className="object-cover grayscale opacity-40"
              aria-hidden="true"
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container"
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="px-5 pb-5">
          <div className="relative -mt-8 mb-4 flex items-end justify-between">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-xl border-4 border-surface-container bg-surface-container-high overflow-hidden">
                {specialist.avatarUrl ? (
                  <Image
                    src={specialist.avatarUrl}
                    alt={specialist.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-container/20">
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

            {/* Price */}
            <div className="text-right">
              {isFree ? (
                <span className="text-emerald-400 font-black text-sm px-2 py-0.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
                  Free
                </span>
              ) : (
                <div>
                  <span className="text-white font-black text-lg">
                    {formatCurrency(specialist.subscriptionPrice)}
                  </span>
                  <span className="text-outline text-xs">/mo</span>
                </div>
              )}
            </div>
          </div>

          {/* Name & specialty */}
          <h3 className="text-white font-bold text-base tracking-tight mb-0.5 group-hover:text-primary transition-colors duration-200 truncate">
            {specialist.name}
          </h3>
          {specialist.specialty && (
            <p className="text-outline text-xs mb-2 truncate">{specialist.specialty}</p>
          )}
          {specialist.tagline && (
            <p className="text-on-surface-variant text-sm line-clamp-2 mb-3">
              {specialist.tagline}
            </p>
          )}

          {/* Subscriber count */}
          {typeof subscriberCount === 'number' && (
            <div className="flex items-center gap-1 text-outline text-xs">
              <span
                className="material-symbols-outlined text-[14px]"
                aria-hidden="true"
              >
                group
              </span>
              <span>
                {subscriberCount === 0
                  ? 'Be the first subscriber'
                  : `${subscriberCount.toLocaleString()} subscriber${subscriberCount !== 1 ? 's' : ''}`}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
