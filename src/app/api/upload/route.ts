export const maxDuration = 60 // seconds — allow time for large video uploads

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getPublicUrl } from '@/lib/r2'

// Explicit allowlist — prevents path traversal and unintended bucket prefixes
const ALLOWED_FOLDERS = new Set(['avatars', 'covers', 'posts', 'media'])

const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024   // 10 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024   // 50 MB

function makeR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const file = formData.get('file')
  const folder = (formData.get('folder') as string | null) ?? 'media'

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file field' }, { status: 400 })
  }

  const contentType = file.type
  const ext = ALLOWED_CONTENT_TYPES[contentType]
  if (!ext) {
    return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, MP4' }, { status: 400 })
  }

  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json(
      { error: `Invalid folder. Allowed: ${[...ALLOWED_FOLDERS].join(', ')}` },
      { status: 400 }
    )
  }

  const isVideo = contentType === 'video/mp4'
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
  if (file.size > maxBytes) {
    const maxMb = maxBytes / 1024 / 1024
    return NextResponse.json({ error: `File too large. Max: ${maxMb} MB` }, { status: 400 })
  }

  const key = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const r2 = makeR2Client()
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )

  const publicUrl = getPublicUrl(key)
  return NextResponse.json({ publicUrl, key })
}
