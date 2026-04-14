import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createStripeProduct, createStripePrice } from '@/lib/stripe'
import { generateSlug } from '@/lib/utils'

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    console.error('[POST /api/specialists] DATABASE_URL is not set')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) {
      // Fallback: If webhook didn't sync locally, create user on the fly
      const { clerkClient } = await import('@clerk/nextjs/server')
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName ?? ''}`.trim() : null,
          avatarUrl: clerkUser.imageUrl,
        },
      })
    }

    const body = await req.json()
    const {
      name,
      bio,
      specialty,
      tagline,
      type,
      systemPrompt,
      subscriptionPrice,
      avatarUrl,
      coverUrl,
      isPublished,
    }: {
      name: string
      bio?: string
      specialty?: string
      tagline?: string
      type?: string
      systemPrompt?: string
      subscriptionPrice?: number
      avatarUrl?: string
      coverUrl?: string
      isPublished?: boolean
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 })
    }

    // Derive a unique slug, appending an incrementing suffix if the base is taken
    let slug = generateSlug(name)
    let attempt = 0
    while (attempt < 50) {
      const existing = await prisma.specialist.findUnique({ where: { slug } })
      if (!existing) break
      attempt++
      slug = `${generateSlug(name)}-${attempt}`
    }
    if (attempt >= 50) {
      return NextResponse.json({ error: 'Could not generate unique slug' }, { status: 500 })
    }

    // Provision Stripe product + monthly price when a non-zero price is provided
    let stripeProductId: string | undefined
    let stripePriceId: string | undefined

    const priceInCents = subscriptionPrice ?? 0
    if (priceInCents > 0) {
      try {
        const product = await createStripeProduct(name, bio ?? undefined)
        stripeProductId = product.id
        const price = await createStripePrice(product.id, priceInCents)
        stripePriceId = price.id
      } catch (stripeErr) {
        console.error('[POST /api/specialists] Stripe error:', stripeErr)
        return NextResponse.json(
          { error: 'Failed to configure subscription pricing. Check Stripe configuration.' },
          { status: 502 },
        )
      }
    }

    const specialistType = type === 'AI' ? ('AI' as const) : ('HUMAN' as const)

    const specialist = await prisma.specialist.create({
      data: {
        creatorId: user.id,
        name,
        slug,
        bio: bio ?? null,
        specialty: specialty ?? null,
        tagline: tagline ?? null,
        type: specialistType,
        // Only store system prompts on AI specialists
        systemPrompt: specialistType === 'AI' ? (systemPrompt ?? null) : null,
        subscriptionPrice: priceInCents,
        avatarUrl: avatarUrl ?? null,
        coverUrl: coverUrl ?? null,
        isPublished: isPublished ?? false,
        stripeProductId,
        stripePriceId,
      },
    })

    // Promote user to CREATOR role the first time they create a specialist
    if (user.role !== 'CREATOR') {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'CREATOR' },
      })
    }

    return NextResponse.json(specialist, { status: 201 })
  } catch (error) {
    console.error('[POST /api/specialists]', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  // Default: return only published specialists (pass ?published=false to override)
  const published = searchParams.get('published') !== 'false'

  const specialists = await prisma.specialist.findMany({
    where: published ? { isPublished: true } : {},
    include: {
      creator: { select: { name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(specialists)
}
