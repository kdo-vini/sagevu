import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { ReplyPanel } from './ReplyPanel'
import type { Message } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { specialist: { select: { name: true } }, subscriber: { select: { name: true } } },
  })
  if (!conversation) return { title: 'Conversation Not Found' }
  return {
    title: `Conversation with ${conversation.subscriber.name ?? 'Subscriber'} — ${conversation.specialist.name} | Sagevu`,
  }
}

export default async function CreatorConversationPage({ params }: PageProps) {
  const { id: conversationId } = await params
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) redirect('/sign-in')

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      specialist: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatarUrl: true,
          type: true,
          creatorId: true,
        },
      },
      subscriber: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 100,
      },
    },
  })

  if (!conversation) notFound()

  // Only the specialist's creator may access this page
  if (conversation.specialist.creatorId !== user.id) {
    redirect('/dashboard')
  }

  // AI specialists don't need a manual reply interface
  if (conversation.specialist.type === 'AI') {
    redirect(`/${conversation.specialist.slug}/chat`)
  }

  const subscriberDisplayName = conversation.subscriber.name ?? conversation.subscriber.email ?? 'Subscriber'

  const initialMessages: Message[] = conversation.messages.map((m) => ({
    id: m.id,
    conversationId: m.conversationId,
    role: m.role as 'USER' | 'ASSISTANT',
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }))

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Conversation header */}
      <header className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-outline-variant/20 bg-surface-container-low flex-shrink-0">
        <Link
          href="/messages"
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-surface-container-high border border-outline-variant/10 hover:bg-surface-variant transition-colors"
          aria-label="Back to messages"
        >
          <span className="material-symbols-outlined text-outline text-lg" aria-hidden="true">
            arrow_back
          </span>
        </Link>

        {/* Subscriber avatar + name */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/10"
            aria-hidden="true"
          >
            {conversation.subscriber.avatarUrl ? (
              <img
                src={conversation.subscriber.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-container-highest">
                <span className="text-sm font-bold text-on-surface-variant">
                  {subscriberDisplayName[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-bold text-sm truncate">{subscriberDisplayName}</h2>
            <p className="text-outline text-xs">Subscriber</p>
          </div>
        </div>

        {/* Specialist identity notice */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <div className="w-5 h-5 rounded-full overflow-hidden bg-surface-container-high">
            {conversation.specialist.avatarUrl ? (
              <img
                src={conversation.specialist.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-container/20">
                <span className="text-[10px] font-bold text-primary">
                  {conversation.specialist.name[0]}
                </span>
              </div>
            )}
          </div>
          <span className="text-primary text-xs font-bold">
            Replying as {conversation.specialist.name}
          </span>
        </div>
      </header>

      {/* Replying-as notice on mobile */}
      <div
        className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 bg-primary/5 border-b border-primary/10"
        aria-live="polite"
      >
        <span className="material-symbols-outlined text-primary text-sm" aria-hidden="true">
          reply
        </span>
        <span className="text-primary text-xs font-bold">
          Replying as {conversation.specialist.name}
        </span>
      </div>

      {/* Interactive reply panel (client component) */}
      <div className="flex-1 overflow-hidden">
        <ReplyPanel
          conversationId={conversationId}
          initialMessages={initialMessages}
          specialistName={conversation.specialist.name}
          specialistAvatarUrl={conversation.specialist.avatarUrl ?? null}
          subscriberName={subscriberDisplayName}
          subscriberAvatarUrl={conversation.subscriber.avatarUrl ?? null}
        />
      </div>
    </div>
  )
}
