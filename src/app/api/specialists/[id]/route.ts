import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
  }> = await req.json()

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
    },
  })

  return NextResponse.json(updated)
}
