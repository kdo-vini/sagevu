import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Navbar } from '@/components/layout/Navbar'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { prisma } from '@/lib/prisma'
import type { Specialist, Message } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const specialist = await prisma.specialist.findUnique({ where: { slug } })
  if (!specialist) return { title: 'Not Found' }
  return {
    title: `Chat with ${specialist.name} — Sagevu`,
    description: `Direct messaging with ${specialist.name} on Sagevu.`,
  }
}

export default async function ChatPage({ params }: PageProps) {
  const { slug } = await params
  const { userId } = await auth()

  if (!userId) {
    redirect(`/sign-in?redirect_url=/${slug}/chat`)
  }

  const specialist = await prisma.specialist.findUnique({ where: { slug } })
  if (!specialist || !specialist.isPublished) notFound()

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) redirect('/sign-in')

  // Verify subscription — owner bypasses check
  const isOwner = user.id === specialist.creatorId
  if (!isOwner) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        subscriberId: user.id,
        specialistId: specialist.id,
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
      specialistId_subscriberId: {
        specialistId: specialist.id,
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

  const specialistData: Specialist = {
    id: specialist.id,
    creatorId: specialist.creatorId,
    name: specialist.name,
    slug: specialist.slug,
    bio: specialist.bio ?? null,
    avatarUrl: specialist.avatarUrl ?? null,
    coverUrl: specialist.coverUrl ?? null,
    type: specialist.type as 'HUMAN' | 'AI',
    specialty: specialist.specialty ?? null,
    tagline: specialist.tagline ?? null,
    isPublished: specialist.isPublished,
    subscriptionPrice: specialist.subscriptionPrice,
    currency: specialist.currency,
    stripePriceId: specialist.stripePriceId ?? null,
    createdAt: specialist.createdAt.toISOString(),
    updatedAt: specialist.updatedAt.toISOString(),
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
            specialist={specialistData}
            conversationId={conversation?.id ?? null}
            initialMessages={initialMessages}
          />
        </div>
      </div>
    </div>
  )
}
