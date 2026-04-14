import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { openai, GPT_MODEL } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      specialistId,
      content,
      conversationId,
    }: { specialistId: string; content: string; conversationId?: string } =
      await req.json()

    if (!specialistId || !content) {
      return NextResponse.json(
        { error: 'Missing specialistId or content' },
        { status: 400 }
      )
    }

    // Resolve internal user record from Clerk ID
    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify the caller has an active, non-expired subscription for this specialist
    const subscription = await prisma.subscription.findFirst({
      where: {
        subscriberId: user.id,
        specialistId,
        status: 'ACTIVE',
        currentPeriodEnd: { gt: new Date() },
      },
    })
    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 403 }
      )
    }

    const specialist = await prisma.specialist.findUnique({ where: { id: specialistId } })
    if (!specialist) {
      return NextResponse.json({ error: 'Specialist not found' }, { status: 404 })
    }

    // Get an existing conversation by explicit ID, or upsert the canonical
    // one-per-(specialist, subscriber) record
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      })
    }
    if (!conversation) {
      conversation = await prisma.conversation.upsert({
        where: {
          specialistId_subscriberId: { specialistId, subscriberId: user.id },
        },
        create: { specialistId, subscriberId: user.id },
        update: {},
      })
    }

    // Load the last 20 messages for context window (oldest first)
    const previousMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
    })

    // Persist the incoming user message before calling OpenAI so it is
    // never lost even if the stream errors mid-flight
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content,
      },
    })

    // Build the message array for OpenAI, mapping DB roles to API roles
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...previousMessages.map((m) => ({
        role: m.role === 'USER' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      })),
      { role: 'user', content },
    ]

    if (specialist.type === 'AI') {
      // Stream GPT-4o response back to the client as plain text chunks
      const stream = await openai.chat.completions.create({
        model: GPT_MODEL,
        max_tokens: 1024,
        messages: [
          ...(specialist.systemPrompt
            ? [{ role: 'system' as const, content: specialist.systemPrompt }]
            : []),
          ...messages,
        ],
        stream: true,
      })

      // Capture the full assembled response so we can persist it after the
      // stream completes — we cannot await inside the ReadableStream start
      // callback, so we collect into a variable and write in the finally block
      let fullContent = ''
      const conversationId_ = conversation.id

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const delta = chunk.choices[0]?.delta?.content ?? ''
              if (delta) {
                fullContent += delta
                controller.enqueue(new TextEncoder().encode(delta))
              }
            }
          } catch (streamError) {
            console.error('[api/chat] Stream error:', streamError)
            controller.error(streamError)
          } finally {
            // Always persist the assistant reply, even if the client disconnects
            if (fullContent) {
              await prisma.message.create({
                data: {
                  conversationId: conversationId_,
                  role: 'ASSISTANT',
                  content: fullContent,
                },
              })
            }
            controller.close()
          }
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
          'X-Conversation-Id': conversation.id,
        },
      })
    } else {
      // HUMAN specialist — message is stored; creator replies asynchronously
      return NextResponse.json({
        success: true,
        conversationId: conversation.id,
        message: 'Message sent. The creator will respond soon.',
      })
    }
  } catch (error) {
    console.error('[api/chat] Unhandled error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
