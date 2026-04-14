import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { specialistId }: { specialistId: string } = await req.json()

  if (!specialistId) {
    return NextResponse.json({ error: 'Missing specialistId' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const specialist = await prisma.specialist.findUnique({ where: { id: specialistId } })
  if (!specialist || !specialist.isPublished) {
    return NextResponse.json({ error: 'Specialist not found' }, { status: 404 })
  }

  if (specialist.creatorId === user.id) {
    return NextResponse.json(
      { error: 'You cannot subscribe to your own specialist' },
      { status: 400 }
    )
  }

  if (!specialist.stripePriceId) {
    return NextResponse.json(
      { error: 'Subscription not configured' },
      { status: 400 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await createCheckoutSession({
    priceId: specialist.stripePriceId,
    specialistId,
    subscriberId: user.id,
    successUrl: `${appUrl}/${specialist.slug}?subscribed=true`,
    cancelUrl: `${appUrl}/${specialist.slug}`,
    customerEmail: user.email,
  })

  return NextResponse.json({ url: session.url })
}
