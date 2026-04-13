import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { personaId }: { personaId: string } = await req.json()

  if (!personaId) {
    return NextResponse.json({ error: 'Missing personaId' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const persona = await prisma.persona.findUnique({ where: { id: personaId } })
  if (!persona || !persona.isPublished) {
    return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
  }

  if (!persona.stripePriceId) {
    return NextResponse.json(
      { error: 'Subscription not configured' },
      { status: 400 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await createCheckoutSession({
    priceId: persona.stripePriceId,
    personaId,
    subscriberId: user.id,
    successUrl: `${appUrl}/${persona.slug}?subscribed=true`,
    cancelUrl: `${appUrl}/${persona.slug}`,
    customerEmail: user.email,
  })

  return NextResponse.json({ url: session.url })
}
