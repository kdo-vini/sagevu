import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

type SpecialistSnippet = {
  name: string
  avatarUrl: string | null
  slug: string
}

type UnlockedPost = {
  id: string
  specialistId: string
  content: string
  mediaUrls: string[]
  visibility: 'PUBLIC' | 'SUBSCRIBERS_ONLY'
  createdAt: Date
  updatedAt: Date
  specialist: SpecialistSnippet
  locked: false
}

type LockedPost = {
  id: string
  visibility: 'SUBSCRIBERS_ONLY'
  createdAt: Date
  specialist: SpecialistSnippet
  locked: true
}

type PostResponse = UnlockedPost | LockedPost

// ---------------------------------------------------------------------------
// GET /api/posts?specialistId=&limit=&cursor=
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const specialistId = searchParams.get('specialistId')
  if (!specialistId) {
    return NextResponse.json({ error: 'specialistId is required' }, { status: 400 })
  }

  const rawLimit = parseInt(searchParams.get('limit') ?? '20', 10)
  const limit = Number.isNaN(rawLimit) ? 20 : Math.min(Math.max(rawLimit, 1), 50)
  const cursor = searchParams.get('cursor') ?? undefined

  // Resolve caller identity (unauthenticated callers are fine)
  const { userId: clerkId } = await auth()

  let callerUserId: string | null = null
  if (clerkId) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })
    callerUserId = user?.id ?? null
  }

  // Determine access level ─ we need the specialist's creatorId to check owner access
  const specialist = await prisma.specialist.findUnique({
    where: { id: specialistId },
    select: { creatorId: true },
  })
  if (!specialist) {
    return NextResponse.json({ error: 'Specialist not found' }, { status: 404 })
  }

  const isOwner = callerUserId !== null && callerUserId === specialist.creatorId

  let isSubscriber = false
  if (!isOwner && callerUserId !== null) {
    const sub = await prisma.subscription.findFirst({
      where: {
        subscriberId: callerUserId,
        specialistId,
        status: 'ACTIVE',
        currentPeriodEnd: { gt: new Date() },
      },
      select: { id: true },
    })
    isSubscriber = sub !== null
  }

  const canSeeAll = isOwner || isSubscriber

  // Fetch one extra post to detect whether there is a next page
  const posts = await prisma.post.findMany({
    where: { specialistId },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor
      ? { skip: 1, cursor: { id: cursor } }
      : {}),
    select: {
      id: true,
      specialistId: true,
      content: true,
      mediaUrls: true,
      visibility: true,
      createdAt: true,
      updatedAt: true,
      specialist: {
        select: { name: true, avatarUrl: true, slug: true },
      },
    },
  })

  const hasMore = posts.length > limit
  const page = hasMore ? posts.slice(0, limit) : posts
  const nextCursor = hasMore ? (page[page.length - 1]?.id ?? null) : null

  const result: PostResponse[] = page.map((post) => {
    const isLocked =
      !canSeeAll && post.visibility === 'SUBSCRIBERS_ONLY'

    if (isLocked) {
      const locked: LockedPost = {
        id: post.id,
        visibility: 'SUBSCRIBERS_ONLY',
        createdAt: post.createdAt,
        specialist: post.specialist,
        locked: true,
      }
      return locked
    }

    const unlocked: UnlockedPost = {
      id: post.id,
      specialistId: post.specialistId,
      content: post.content,
      mediaUrls: post.mediaUrls,
      visibility: post.visibility as 'PUBLIC' | 'SUBSCRIBERS_ONLY',
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      specialist: post.specialist,
      locked: false,
    }
    return unlocked
  })

  return NextResponse.json({ posts: result, nextCursor })
}

// ---------------------------------------------------------------------------

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
