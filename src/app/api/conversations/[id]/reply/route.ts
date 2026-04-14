import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MAX_CONTENT_LENGTH = 2000

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params

    // Resolve internal user record from Clerk ID
    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Load the conversation and verify the requester is the creator of the specialist
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        specialist: {
          select: { id: true, name: true, type: true, creatorId: true },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Only the creator of the specialist may post assistant replies via this endpoint
    if (conversation.specialist.creatorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // AI specialists reply automatically — human-side reply endpoint is for HUMAN only
    if (conversation.specialist.type === 'AI') {
      return NextResponse.json(
        { error: 'AI specialist conversations cannot be replied to manually' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const rawContent = body?.content
    const content = typeof rawContent === 'string' ? rawContent.trim() : ''

    if (!content) {
      return NextResponse.json({ error: 'Reply content is required' }, { status: 400 })
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Reply exceeds maximum length of ${MAX_CONTENT_LENGTH} characters` },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content,
      },
    })

    return NextResponse.json(
      {
        id: message.id,
        conversationId: message.conversationId,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[api/conversations/[id]/reply] Unhandled error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
