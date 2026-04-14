import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  updateStripePrice,
  createStripePrice,
  createStripeProduct,
} from '@/lib/stripe'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const specialist = await prisma.specialist.findUnique({ where: { id } })
  if (!specialist) {
    return NextResponse.json({ error: 'Specialist not found' }, { status: 404 })
  }
  if (specialist.creatorId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(specialist)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const specialist = await prisma.specialist.findUnique({ where: { id } })
  if (!specialist) {
    return NextResponse.json({ error: 'Specialist not found' }, { status: 404 })
  }
  if (specialist.creatorId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body: Partial<{
    name: string
    bio: string | null
    specialty: string | null
    tagline: string | null
    systemPrompt: string | null
    avatarUrl: string | null
    coverUrl: string | null
    isPublished: boolean
    subscriptionPrice: number
  }> = await req.json()

  // Resolve Stripe IDs before updating the DB record so we can persist them.
  let stripeProductId = specialist.stripeProductId
  let stripePriceId = specialist.stripePriceId

  if (
    body.subscriptionPrice !== undefined &&
    body.subscriptionPrice !== specialist.subscriptionPrice
  ) {
    try {
      if (stripeProductId && stripePriceId) {
        const newPrice = await updateStripePrice(
          stripeProductId,
          stripePriceId,
          body.subscriptionPrice
        )
        stripePriceId = newPrice.id
      } else if (stripeProductId && !stripePriceId) {
        const newPrice = await createStripePrice(
          stripeProductId,
          body.subscriptionPrice
        )
        stripePriceId = newPrice.id
      } else {
        const product = await createStripeProduct(
          specialist.name,
          specialist.bio ?? undefined
        )
        stripeProductId = product.id
        const newPrice = await createStripePrice(
          stripeProductId,
          body.subscriptionPrice
        )
        stripePriceId = newPrice.id
      }
    } catch (err) {
      console.error('[PATCH /api/specialists/:id] Stripe sync failed:', err)
      return NextResponse.json(
        { error: 'Failed to sync subscription price with Stripe' },
        { status: 502 }
      )
    }
  }

  const updated = await prisma.specialist.update({
    where: { id },
    data: {
      name: body.name ?? specialist.name,
      bio: body.bio !== undefined ? body.bio : specialist.bio,
      specialty:
        body.specialty !== undefined ? body.specialty : specialist.specialty,
      tagline: body.tagline !== undefined ? body.tagline : specialist.tagline,
      systemPrompt:
        body.systemPrompt !== undefined
          ? body.systemPrompt
          : specialist.systemPrompt,
      avatarUrl:
        body.avatarUrl !== undefined ? body.avatarUrl : specialist.avatarUrl,
      coverUrl: body.coverUrl !== undefined ? body.coverUrl : specialist.coverUrl,
      isPublished: body.isPublished ?? specialist.isPublished,
      ...(body.subscriptionPrice !== undefined && {
        subscriptionPrice: body.subscriptionPrice,
        stripeProductId,
        stripePriceId,
      }),
    },
  })

  return NextResponse.json(updated)
}
