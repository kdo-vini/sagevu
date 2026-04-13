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

  const persona = await prisma.persona.findUnique({ where: { id } })
  if (!persona) {
    return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
  }
  if (persona.creatorId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(persona)
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

  const persona = await prisma.persona.findUnique({ where: { id } })
  if (!persona) {
    return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
  }
  if (persona.creatorId !== user.id) {
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

  const updated = await prisma.persona.update({
    where: { id },
    data: {
      name: body.name ?? persona.name,
      bio: body.bio !== undefined ? body.bio : persona.bio,
      specialty:
        body.specialty !== undefined ? body.specialty : persona.specialty,
      tagline: body.tagline !== undefined ? body.tagline : persona.tagline,
      systemPrompt:
        body.systemPrompt !== undefined
          ? body.systemPrompt
          : persona.systemPrompt,
      avatarUrl:
        body.avatarUrl !== undefined ? body.avatarUrl : persona.avatarUrl,
      coverUrl: body.coverUrl !== undefined ? body.coverUrl : persona.coverUrl,
      isPublished: body.isPublished ?? persona.isPublished,
    },
  })

  return NextResponse.json(updated)
}
