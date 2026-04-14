'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { VideoUpload } from '@/components/ui/VideoUpload'
import { MediaCarousel } from '@/components/ui/MediaCarousel'
import ReactMarkdown from 'react-markdown'

const MAX_IMAGES = 6

type Visibility = 'PUBLIC' | 'SUBSCRIBERS_ONLY'
type Tab = 'write' | 'preview'

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC' as Visibility, label: 'Public', desc: 'Visible to everyone', icon: 'public' },
  { value: 'SUBSCRIBERS_ONLY' as Visibility, label: 'Subscribers Only', desc: 'Locked for non-subscribers', icon: 'lock' },
]

export default function NewPostPage() {
  const router = useRouter()
  const params = useParams()
  const specialistId = params.specialistId as string

  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('PUBLIC')
  const [images, setImages] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState('')
  const [tab, setTab] = useState<Tab>('write')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const mediaUrls = [...images, ...(videoUrl ? [videoUrl] : [])]

  async function handleSubmit(e: React.FormEvent) {
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
        body: JSON.stringify({ specialistId, content, visibility, mediaUrls }),
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

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-white">New Post</h1>
        <p className="text-outline mt-1 text-sm">Share insights, analysis, and content with your audience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Editor */}
        <section className="bg-surface-container rounded-xl border border-outline-variant/10 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-outline-variant/10">
            {(['write', 'preview'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-bold capitalize transition-colors ${
                  tab === t
                    ? 'text-white border-b-2 border-primary -mb-px'
                    : 'text-outline hover:text-on-surface-variant'
                }`}
              >
                {t}
              </button>
            ))}
            <div className="ml-auto flex items-center px-4 gap-1 text-outline text-xs">
              <span className="material-symbols-outlined text-sm">info</span>
              Markdown supported
            </div>
          </div>

          <div className="p-4">
            {tab === 'write' ? (
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Share your thoughts, insights, frameworks...&#10;&#10;Use **bold**, *italic*, ## headings, - bullet lists"
                maxLength={5000}
              />
            ) : (
              <div className="min-h-[200px] px-2">
                {content.trim() ? (
                  <div className="text-on-surface-variant text-sm leading-relaxed">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-white text-xl font-black mb-3 mt-4 first:mt-0">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-white text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-white text-base font-bold mb-2 mt-2 first:mt-0">{children}</h3>,
                        strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        ul: ({ children }) => <ul className="my-2 space-y-1.5">{children}</ul>,
                        ol: ({ children }) => <ol className="my-2 space-y-1.5">{children}</ol>,
                        li: ({ children, ...props }) => {
                          const isOrdered = (props as { ordered?: boolean }).ordered
                          return (
                            <li className="flex gap-2 text-sm">
                              <span className="text-primary flex-shrink-0 font-bold leading-5">{isOrdered ? '→' : '•'}</span>
                              <span>{children}</span>
                            </li>
                          )
                        },
                        p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>,
                        hr: () => <hr className="border-outline-variant/20 my-3" />,
                        code: ({ children }) => <code className="bg-surface-container-highest text-primary px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                        blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-outline italic text-sm">{children}</blockquote>,
                      }}
                    >
                      {content}
                    </ReactMarkdown>

                    {/* Media preview */}
                    {(images.length > 0 || videoUrl) && (
                      <MediaCarousel images={images} videoUrl={videoUrl || undefined} />
                    )}
                  </div>
                ) : (
                  <p className="text-outline text-sm italic">Nothing to preview yet.</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Media */}
        <section className="bg-surface-container rounded-xl p-5 border border-outline-variant/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-sm">Media</h2>
            <span className="text-outline text-xs">{images.length}/{MAX_IMAGES} images{videoUrl ? ', 1 video' : ''}</span>
          </div>

          {/* Images */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((url, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-surface-container-high">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error"
                    aria-label="Remove image"
                  >
                    <span className="material-symbols-outlined text-white text-xs">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {images.length < MAX_IMAGES && (
              <ImageUpload
                value=""
                onChange={(url) => { if (url) setImages((prev) => [...prev, url]) }}
                folder="posts"
                aspect="square"
                label={images.length === 0 ? 'Add images' : 'Add more'}
              />
            )}
          </div>

          {/* Video */}
          {!videoUrl ? (
            <div>
              <Label className="text-outline text-xs mb-2 block">Video (optional, MP4, max 50 MB)</Label>
              <VideoUpload value="" onChange={setVideoUrl} folder="posts" />
            </div>
          ) : (
            <div>
              <Label className="text-outline text-xs mb-2 block">Video</Label>
              <VideoUpload value={videoUrl} onChange={setVideoUrl} folder="posts" />
            </div>
          )}
        </section>

        {/* Visibility */}
        <section className="bg-surface-container rounded-xl p-5 border border-outline-variant/10">
          <h2 className="text-white font-bold text-sm mb-3">Visibility</h2>
          <div className="grid grid-cols-2 gap-3" role="radiogroup">
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
                  <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">
                    {opt.icon}
                  </span>
                  <span className="text-white font-bold text-sm">{opt.label}</span>
                </div>
                <p className="text-outline text-xs">{opt.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div role="alert" className="bg-error/10 border border-error/20 rounded-xl p-4 text-error text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.push('/dashboard')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !content.trim()} className="flex-1">
            {loading ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                Publishing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">publish</span>
                Publish Post
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
