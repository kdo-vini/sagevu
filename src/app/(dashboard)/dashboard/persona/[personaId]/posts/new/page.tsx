'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/ui/ImageUpload'

type Visibility = 'PUBLIC' | 'SUBSCRIBERS_ONLY'

interface VisibilityOption {
  value: Visibility
  label: string
  desc: string
  icon: string
}

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  {
    value: 'PUBLIC',
    label: 'Public',
    desc: 'Visible to everyone',
    icon: 'public',
  },
  {
    value: 'SUBSCRIBERS_ONLY',
    label: 'Subscribers Only',
    desc: 'Locked for non-subscribers',
    icon: 'lock',
  },
]

export default function NewPostPage() {
  const router = useRouter()
  const params = useParams()
  const personaId = params.personaId as string

  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('PUBLIC')
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!content.trim()) {
      setError('Post content is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId,
          content,
          visibility,
          mediaUrls,
        }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Failed to create post')
        return
      }
      router.push('/dashboard')
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-white">
          New Post
        </h1>
        <p className="text-outline mt-1">Share content with your subscribers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Content */}
        <section
          className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 space-y-4"
          aria-labelledby="content-heading"
        >
          <div className="space-y-2">
            <Label htmlFor="post-content">Content *</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, insights, analysis..."
              rows={8}
              className="text-base"
              aria-required="true"
            />
            <p className="text-outline text-xs text-right" aria-live="polite">
              {content.length} characters
            </p>
          </div>
        </section>

        {/* Visibility */}
        <section
          className="bg-surface-container rounded-xl p-6 border border-outline-variant/10"
          aria-labelledby="visibility-heading"
        >
          <h2 id="visibility-heading" className="text-white font-bold mb-4">
            Visibility
          </h2>
          <div
            className="grid grid-cols-2 gap-4"
            role="radiogroup"
            aria-labelledby="visibility-heading"
          >
            {VISIBILITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={visibility === opt.value}
                onClick={() => setVisibility(opt.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  visibility === opt.value
                    ? 'border-primary bg-primary/10'
                    : 'border-outline-variant/20 bg-surface-container-high hover:border-outline-variant/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="material-symbols-outlined text-primary text-base"
                    aria-hidden="true"
                  >
                    {opt.icon}
                  </span>
                  <span className="text-white font-bold text-sm">
                    {opt.label}
                  </span>
                </div>
                <p className="text-outline text-xs">{opt.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Media */}
        <section
          className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 space-y-4"
          aria-labelledby="media-heading"
        >
          <h2 id="media-heading" className="text-white font-bold">
            Media <span className="text-outline font-normal text-sm">(optional)</span>
          </h2>
          <div className="flex flex-wrap gap-4">
            {mediaUrls.map((url, i) => (
              <div key={i} className="relative">
                <ImageUpload
                  value={url}
                  onChange={(newUrl) => {
                    if (!newUrl) {
                      setMediaUrls((prev) => prev.filter((_, idx) => idx !== i))
                    } else {
                      setMediaUrls((prev) =>
                        prev.map((u, idx) => (idx === i ? newUrl : u))
                      )
                    }
                  }}
                  folder="posts"
                  aspect="square"
                  label="Image"
                />
              </div>
            ))}
            {mediaUrls.length < 4 && (
              <ImageUpload
                value=""
                onChange={(url) => {
                  if (url) setMediaUrls((prev) => [...prev, url])
                }}
                folder="posts"
                aspect="square"
                label="Add Image"
              />
            )}
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="bg-error/10 border border-error/20 rounded-xl p-4 text-error text-sm flex items-center gap-2"
          >
            <span
              className="material-symbols-outlined text-base"
              aria-hidden="true"
            >
              error
            </span>
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <span
                  className="material-symbols-outlined text-base animate-spin"
                  aria-hidden="true"
                >
                  progress_activity
                </span>
                Publishing...
              </>
            ) : (
              <>
                <span
                  className="material-symbols-outlined text-base"
                  aria-hidden="true"
                >
                  publish
                </span>
                Publish Post
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
