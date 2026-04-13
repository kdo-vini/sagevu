import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Navbar } from '@/components/layout/Navbar'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { prisma } from '@/lib/prisma'
import type { Persona, Message } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const persona = await prisma.persona.findUnique({ where: { slug } })
  if (!persona) return { title: 'Not Found' }
  return {
    title: `Chat with ${persona.name} — Sagevu`,
    description: `Direct messaging with ${persona.name} on Sagevu.`,
  }
}

export default async function ChatPage({ params }: PageProps) {
  const { slug } = await params
  const { userId } = await auth()

  if (!userId) {
    redirect(`/sign-in?redirect_url=/${slug}/chat`)
  }

  const persona = await prisma.persona.findUnique({ where: { slug } })
  if (!persona || !persona.isPublished) notFound()

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) redirect('/sign-in')

  // Verify subscription — owner bypasses check
  const isOwner = user.id === persona.creatorId
  if (!isOwner) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        subscriberId: user.id,
        personaId: persona.id,
        status: 'ACTIVE',
        currentPeriodEnd: { gt: new Date() },
      },
    })
    if (!subscription) {
      redirect(`/${slug}`)
    }
  }

  // Load or create the conversation record
  const conversation = await prisma.conversation.findUnique({
    where: {
      personaId_subscriberId: {
        personaId: persona.id,
        subscriberId: user.id,
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 50,
      },
    },
  })

  const personaData: Persona = {
    id: persona.id,
    creatorId: persona.creatorId,
    name: persona.name,
    slug: persona.slug,
    bio: persona.bio ?? null,
    avatarUrl: persona.avatarUrl ?? null,
    coverUrl: persona.coverUrl ?? null,
    type: persona.type as 'HUMAN' | 'AI',
    specialty: persona.specialty ?? null,
    tagline: persona.tagline ?? null,
    isPublished: persona.isPublished,
    subscriptionPrice: persona.subscriptionPrice,
    currency: persona.currency,
    stripePriceId: persona.stripePriceId ?? null,
    createdAt: persona.createdAt.toISOString(),
    updatedAt: persona.updatedAt.toISOString(),
  }

  const initialMessages: Message[] = (conversation?.messages ?? []).map(
    (m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role as 'USER' | 'ASSISTANT',
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20 flex flex-col">
        <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col h-[calc(100vh-80px)]">
          <ChatWindow
            persona={personaData}
            conversationId={conversation?.id ?? null}
            initialMessages={initialMessages}
          />
        </div>
      </div>
    </div>
  )
}
