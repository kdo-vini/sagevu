import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { openai, GPT_MODEL } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter
// ---------------------------------------------------------------------------

const HOUR_MS = 60 * 60 * 1000
const AI_RATE_LIMIT = 20    // requests per hour for AI specialists (OpenAI cost)
const HUMAN_RATE_LIMIT = 60  // requests per hour for human specialists

type RateLimitEntry = { count: number; windowStart: number }
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Returns true when the caller is within the allowed rate, false when exceeded.
 * Uses a sliding window keyed on `${userId}:${specialistType}`.
 */
function checkRateLimit(userId: string, isAI: boolean): boolean {
  const limit = isAI ? AI_RATE_LIMIT : HUMAN_RATE_LIMIT
  const key = `${userId}:${isAI ? 'ai' : 'human'}`
  const now = Date.now()

  const entry = rateLimitStore.get(key)

  if (!entry || now - entry.windowStart >= HOUR_MS) {
    // No prior record or the hour window has elapsed — start a fresh window
    rateLimitStore.set(key, { count: 1, windowStart: now })
    return true
  }

  if (entry.count >= limit) {
    return false
  }

  entry.count += 1
  return true
}

// ---------------------------------------------------------------------------
// systemPrompt sanitization
// ---------------------------------------------------------------------------

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/gi,
  /disregard/gi,
  /you\s+are\s+now/gi,
  /act\s+as/gi,
]

const FALLBACK_SYSTEM_PROMPT =
  'You are a helpful expert specialist on Sagevu. Answer questions professionally and stay on topic.'

const MAX_SYSTEM_PROMPT_LENGTH = 4000

function sanitizeSystemPrompt(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return FALLBACK_SYSTEM_PROMPT

  let sanitized = raw.trim()

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '')
  }

  // Collapse any whitespace gaps left behind by removals
  sanitized = sanitized.replace(/\s{2,}/g, ' ').trim()

  if (!sanitized) return FALLBACK_SYSTEM_PROMPT

  return sanitized.slice(0, MAX_SYSTEM_PROMPT_LENGTH)
}

// ---------------------------------------------------------------------------

const MAX_CONTENT_LENGTH = 2000

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      specialistId,
      content: rawContent,
      conversationId,
    }: { specialistId: string; content: string; conversationId?: string } =
      await req.json()

    // Input validation — trim first, then enforce limits
    const content = typeof rawContent === 'string' ? rawContent.trim() : ''

    if (!specialistId || !content) {
      return NextResponse.json(
        { error: 'Missing specialistId or content' },
        { status: 400 }
      )
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Message exceeds maximum length of ${MAX_CONTENT_LENGTH} characters` },
        { status: 400 }
      )
    }

    // Resolve internal user record from Clerk ID
    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const specialist = await prisma.specialist.findUnique({ where: { id: specialistId } })
    if (!specialist) {
      return NextResponse.json({ error: 'Specialist not found' }, { status: 404 })
    }

    // Free specialists are open to all authenticated users.
    // Paid specialists require an active, non-expired subscription.
    if (specialist.subscriptionPrice > 0) {
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
    }
    // Rate limit — checked after subscription verification so we don't burn
    // quota slots for unauthorized callers
    const isAISpecialist = specialist.type === 'AI'
    if (!checkRateLimit(user.id, isAISpecialist)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      )
    }

    // Get an existing conversation by explicit ID, or upsert the canonical
    // one-per-(specialist, subscriber) record.
    // findFirst with all three fields prevents IDOR: a user cannot inject
    // messages into another user's conversation by guessing its ID.
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          subscriberId: user.id,
          specialistId,
        },
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

    // Load the 20 most recent messages for context window, then reverse to
    // chronological order for OpenAI. Fetching desc+take ensures we always
    // send the *latest* context, not the oldest 20 from conversation start.
    const previousMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    previousMessages.reverse()

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
      const safeSystemPrompt = sanitizeSystemPrompt(specialist.systemPrompt)

      // Stream GPT-4o response back to the client as plain text chunks
      const stream = await openai.chat.completions.create({
        model: GPT_MODEL,
        max_tokens: 1024,
        messages: [
          { role: 'system' as const, content: safeSystemPrompt },
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
