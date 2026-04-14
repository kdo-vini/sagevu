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
    specialistId,
    content,
    mediaUrls,
    visibility,
  }: {
    specialistId: string
    content: string
    mediaUrls?: string[]
    visibility?: string
  } = await req.json()

  if (!specialistId || !content) {
    return NextResponse.json(
      { error: 'Missing specialistId or content' },
      { status: 400 }
    )
  }

  // Only the owning creator can post on behalf of a specialist
  const specialist = await prisma.specialist.findFirst({
    where: { id: specialistId, creatorId: user.id },
  })
  if (!specialist) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const post = await prisma.post.create({
    data: {
      specialistId,
      content,
      mediaUrls: mediaUrls ?? [],
      visibility:
        visibility === 'SUBSCRIBERS_ONLY' ? 'SUBSCRIBERS_ONLY' : 'PUBLIC',
    },
    include: {
      specialist: { select: { name: true, avatarUrl: true, slug: true } },
    },
  })

  return NextResponse.json(post, { status: 201 })
}
