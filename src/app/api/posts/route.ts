import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const {
    personaId,
    content,
    mediaUrls,
    visibility,
  }: {
    personaId: string
    content: string
    mediaUrls?: string[]
    visibility?: string
  } = await req.json()

  if (!personaId || !content) {
    return NextResponse.json(
      { error: 'Missing personaId or content' },
      { status: 400 }
    )
  }

  // Only the owning creator can post on behalf of a persona
  const persona = await prisma.persona.findFirst({
    where: { id: personaId, creatorId: user.id },
  })
  if (!persona) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const post = await prisma.post.create({
    data: {
      personaId,
      content,
      mediaUrls: mediaUrls ?? [],
      visibility:
        visibility === 'SUBSCRIBERS_ONLY' ? 'SUBSCRIBERS_ONLY' : 'PUBLIC',
    },
    include: {
      persona: { select: { name: true, avatarUrl: true, slug: true } },
    },
  })

  return NextResponse.json(post, { status: 201 })
}
