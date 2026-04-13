import Image from 'next/image'
import Link from 'next/link'
import { PersonaBadge } from './PersonaBadge'
import { SubscribeButton } from './SubscribeButton'
import { PostFeed } from './PostFeed'
import { formatCurrency } from '@/lib/utils'
import type { Persona, Post } from '@/types'

interface PersonaProfileProps {
  persona: Persona
  posts: Post[]
  isSubscribed: boolean
  currentUserId?: string
}

const SUBSCRIPTION_BENEFITS = [
  'Unlimited Exclusive Feed Access',
  'Direct Priority Messaging',
  'Full Chat Access',
] as const

export function PersonaProfile({
  persona,
  posts,
  isSubscribed,
  currentUserId,
}: PersonaProfileProps) {
  const isOwner = currentUserId === persona.creatorId

  const benefits = [
    ...SUBSCRIPTION_BENEFITS,
    persona.type === 'AI' ? 'AI-Powered Responses' : 'Personal Expert Guidance',
  ]

  return (
    <div>
      {/* Hero Banner */}
      <section className="max-w-6xl mx-auto mb-16" aria-label="Profile header">
        <div className="relative rounded-xl overflow-hidden h-[280px] mb-[-60px]">
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-lowest z-10"
            aria-hidden="true"
          />
          {persona.coverUrl ? (
            <Image
              src={persona.coverUrl}
              alt=""
              fill
              className="object-cover grayscale opacity-40"
              priority
              aria-hidden="true"
            />
          ) : (
            <div
              className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container-highest"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Profile info row */}
        <div className="relative z-20 px-4 md:px-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-xl border-4 border-surface-container-lowest bg-surface-container-high overflow-hidden shadow-2xl">
                {persona.avatarUrl ? (
                  <Image
                    src={persona.avatarUrl}
                    alt={persona.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-container/30">
                    <span className="text-5xl font-black text-primary" aria-hidden="true">
                      {persona.name[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2">
                <PersonaBadge type={persona.type} />
              </div>
            </div>

            {/* Name & tagline */}
            <div className="text-center md:text-left pb-2">
              <h1 className="text-white text-5xl font-black tracking-tighter mb-2 leading-none">
                {persona.name}
              </h1>
              {persona.tagline && (
                <p className="text-on-surface-variant max-w-md font-medium">
                  {persona.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 mb-2">
            {isSubscribed && (
              <Link
                href={`/${persona.slug}/chat`}
                className="px-8 py-3 rounded-xl bg-surface-container-high border border-outline-variant/20 text-white font-bold hover:bg-surface-variant transition-colors duration-200 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">
                  chat
                </span>
                Message
              </Link>
            )}
            {!isOwner && (
              <div className="min-w-[160px]">
                <SubscribeButton
                  personaId={persona.id}
                  personaSlug={persona.slug}
                  subscriptionPrice={persona.subscriptionPrice}
                  isSubscribed={isSubscribed}
                />
              </div>
            )}
            {isOwner && (
              <Link
                href={`/dashboard/persona/${persona.id}/edit`}
                className="px-8 py-3 rounded-xl bg-surface-container-high border border-outline-variant/20 text-white font-bold hover:bg-surface-variant transition-colors duration-200 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">
                  edit
                </span>
                Edit
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Subscription card */}
          {!isSubscribed && !isOwner && persona.subscriptionPrice > 0 && (
            <div className="bg-surface-container rounded-xl p-8 border border-outline-variant/10 shadow-xl overflow-hidden relative">
              <div
                className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"
                aria-hidden="true"
              />
              <h2 className="text-white text-xl font-bold mb-1">
                Intelligence Access
              </h2>
              <p className="text-outline text-sm mb-6">Exclusive Creator Circle</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-white text-4xl font-black">
                  {formatCurrency(persona.subscriptionPrice)}
                </span>
                <span className="text-outline text-sm">/mo</span>
              </div>
              <ul className="space-y-3 mb-8" aria-label="Subscription benefits">
                {benefits.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-on-surface-variant text-sm"
                  >
                    <span
                      className="material-symbols-outlined text-primary text-sm flex-shrink-0"
                      aria-hidden="true"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <SubscribeButton
                personaId={persona.id}
                personaSlug={persona.slug}
                subscriptionPrice={persona.subscriptionPrice}
                isSubscribed={isSubscribed}
              />
            </div>
          )}

          {/* Bio */}
          {persona.bio && (
            <div className="bg-surface-container-low rounded-xl p-6">
              <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-3">
                About
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {persona.bio}
              </p>
            </div>
          )}

          {/* Specialty */}
          {persona.specialty && (
            <div className="bg-surface-container-low rounded-xl p-6">
              <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-3">
                Specialty
              </h3>
              <span className="bg-surface-container-high border border-outline-variant/20 text-on-surface-variant px-4 py-1.5 rounded-full text-xs font-medium inline-block">
                {persona.specialty}
              </span>
            </div>
          )}
        </div>

        {/* Right column — feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-2xl font-black tracking-tight">
              {persona.type === 'AI' ? 'AI Intelligence Feed' : 'Latest Posts'}
            </h2>
          </div>
          <PostFeed
            posts={posts}
            persona={persona}
            isSubscribed={isSubscribed}
          />
        </div>
      </div>
    </div>
  )
}
