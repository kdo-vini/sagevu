import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
import type { SubscriptionStatus } from '@prisma/client'

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'ACTIVE'
    case 'canceled':
      return 'CANCELED'
    case 'past_due':
      return 'PAST_DUE'
    default:
      return 'INCOMPLETE'
  }
}

export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = await headers()
  const signature = headerPayload.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhooks/stripe] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const metadata = subscription.metadata as {
          specialistId?: string
          subscriberId?: string
        }

        if (!metadata.specialistId || !metadata.subscriberId) {
          console.error('[webhooks/stripe] Missing metadata on subscription:', subscription.id, metadata)
          return NextResponse.json({ error: 'Missing required metadata' }, { status: 400 })
        }

        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: subscription.id },
          create: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            subscriberId: metadata.subscriberId,
            specialistId: metadata.specialistId,
            status: mapStripeStatus(subscription.status),
            currentPeriodEnd: new Date(
              (subscription.current_period_end as unknown as number) * 1000
            ),
          },
          update: {
            status: mapStripeStatus(subscription.status),
            currentPeriodEnd: new Date(
              (subscription.current_period_end as unknown as number) * 1000
            ),
          },
        })

        // Notify the specialist's creator about the new subscriber only on creation
        if (event.type === 'customer.subscription.created') {
          const [specialist, subscriber] = await Promise.all([
            prisma.specialist.findUnique({ where: { id: metadata.specialistId } }),
            prisma.user.findUnique({ where: { id: metadata.subscriberId } }),
          ])

          if (specialist) {
            await createNotification({
              userId: specialist.creatorId,
              type: 'NEW_SUBSCRIBER',
              title: 'New subscriber',
              body: `${subscriber?.name ?? 'Someone'} subscribed to ${specialist.name}`,
              link: '/dashboard',
            })
          }
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: 'CANCELED' },
        })

        // Notify the specialist's creator about the cancellation
        const sub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
          include: {
            specialist: true,
            subscriber: true,
          },
        })

        if (sub) {
          await createNotification({
            userId: sub.specialist.creatorId,
            type: 'SUBSCRIBER_CANCELED',
            title: 'Subscriber canceled',
            body: `${sub.subscriber?.name ?? 'A subscriber'} canceled their subscription to ${sub.specialist.name}`,
            link: '/dashboard',
          })
        }

        break
      }
    }
  } catch (error) {
    console.error('[webhooks/stripe] Handler error:', error)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
