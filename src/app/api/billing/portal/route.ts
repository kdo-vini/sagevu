import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Find any subscription that has a Stripe customer ID
  const subscription = await prisma.subscription.findFirst({
    where: { subscriberId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json(
      { error: 'No billing record found. Complete a subscription first.' },
      { status: 404 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${appUrl}/subscriptions`,
  })

  return NextResponse.json({ url: session.url })
}
