import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUploadUrl, getPublicUrl } from '@/lib/r2'

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
])

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    filename,
    contentType,
    folder = 'uploads',
  }: { filename: string; contentType: string; folder?: string } = body

  if (!filename || !contentType) {
    return NextResponse.json(
      { error: 'Missing filename or contentType' },
      { status: 400 }
    )
  }

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
  }

  const ext = filename.split('.').pop() ?? 'bin'
  const key = `${folder}/${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`

  const { url: uploadUrl } = await getUploadUrl(key, contentType)
  const publicUrl = getPublicUrl(key)

  return NextResponse.json({ uploadUrl, publicUrl, key })
}
