import Link from 'next/link'
import Image from 'next/image'
import { PersonaBadge } from './PersonaBadge'
import { formatCurrency } from '@/lib/utils'
import type { Persona } from '@/types'

interface PersonaCardProps {
  persona: Persona
}

export function PersonaCard({ persona }: PersonaCardProps) {
  return (
    <Link href={`/${persona.slug}`} className="block group" aria-label={`View ${persona.name}'s profile`}>
      <article className="bg-surface-container border border-outline-variant/10 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(108,99,255,0.2)]">
        {/* Cover image */}
        <div className="relative h-32 bg-gradient-to-br from-surface-container-high to-surface-container-highest">
          {persona.coverUrl && (
            <Image
              src={persona.coverUrl}
              alt=""
              fill
              className="object-cover grayscale opacity-40"
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="relative -mt-8 mb-4 flex items-end justify-between">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-xl border-4 border-surface-container bg-surface-container-high overflow-hidden">
                {persona.avatarUrl ? (
                  <Image
                    src={persona.avatarUrl}
                    alt={persona.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-container/20">
                    <span className="text-2xl font-black text-primary" aria-hidden="true">
                      {persona.name[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1">
                <PersonaBadge type={persona.type} size="sm" />
              </div>
            </div>

            {/* Price */}
            {persona.subscriptionPrice > 0 && (
              <div className="text-right">
                <span className="text-white font-black text-lg">
                  {formatCurrency(persona.subscriptionPrice)}
                </span>
                <span className="text-outline text-xs">/mo</span>
              </div>
            )}
          </div>

          <h3 className="text-white font-bold text-base tracking-tight mb-1 group-hover:text-primary transition-colors duration-200">
            {persona.name}
          </h3>
          {persona.specialty && (
            <p className="text-outline text-xs mb-2">{persona.specialty}</p>
          )}
          {persona.tagline && (
            <p className="text-on-surface-variant text-sm line-clamp-2">
              {persona.tagline}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
