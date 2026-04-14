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

// Explicit allowlist — prevents path traversal and unintended bucket prefixes
const ALLOWED_FOLDERS = new Set(['avatars', 'covers', 'posts', 'media'])

const MAX_FILENAME_LENGTH = 100

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    filename,
    contentType,
    folder = 'media',
  }: { filename: string; contentType: string; folder?: string } = body

  if (!filename || !contentType) {
    return NextResponse.json(
      { error: 'Missing filename or contentType' },
      { status: 400 }
    )
  }

  if (typeof filename !== 'string' || filename.trim().length === 0) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
  }

  if (filename.length > MAX_FILENAME_LENGTH) {
    return NextResponse.json(
      { error: `Filename exceeds maximum length of ${MAX_FILENAME_LENGTH} characters` },
      { status: 400 }
    )
  }

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
  }

  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json(
      { error: `Invalid folder. Allowed values: ${[...ALLOWED_FOLDERS].join(', ')}` },
      { status: 400 }
    )
  }

  // Derive extension from the content type (authoritative) rather than the
  // caller-supplied filename to prevent extension spoofing
  const EXT_MAP: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
  }
  const ext = EXT_MAP[contentType] ?? 'bin'

  const key = `${folder}/${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`

  const { url: uploadUrl } = await getUploadUrl(key, contentType)
  const publicUrl = getPublicUrl(key)

  return NextResponse.json({ uploadUrl, publicUrl, key })
}
