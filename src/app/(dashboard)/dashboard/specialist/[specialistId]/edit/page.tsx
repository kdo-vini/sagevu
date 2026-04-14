'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/ui/ImageUpload'
import type { Specialist } from '@/types'

interface EditFormState {
  name: string
  bio: string
  specialty: string
  tagline: string
  systemPrompt: string
  isPublished: boolean
  avatarUrl: string
  coverUrl: string
  subscriptionPrice: number
}

export default function EditSpecialistPage() {
  const router = useRouter()
  const params = useParams()
  const specialistId = params.specialistId as string

  const [specialist, setSpecialist] = useState<Specialist | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState<EditFormState>({
    name: '',
    bio: '',
    specialty: '',
    tagline: '',
    systemPrompt: '',
    isPublished: false,
    avatarUrl: '',
    coverUrl: '',
    subscriptionPrice: 0,
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/specialists/${specialistId}`)
        if (res.ok) {
          const data = (await res.json()) as Specialist & {
            systemPrompt?: string | null
          }
          setSpecialist(data)
          setForm({
            name: data.name ?? '',
            bio: data.bio ?? '',
            specialty: data.specialty ?? '',
            tagline: data.tagline ?? '',
            systemPrompt:
              (data as unknown as { systemPrompt?: string | null })
                .systemPrompt ?? '',
            isPublished: data.isPublished,
            avatarUrl: data.avatarUrl ?? '',
            coverUrl: data.coverUrl ?? '',
            // DB stores cents; display as currency units (e.g. BRL reais)
            subscriptionPrice: (data.subscriptionPrice ?? 0) / 100,
          })
        }
      } catch {
        setError('Failed to load specialist.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [specialistId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch(`/api/specialists/${specialistId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          // Convert back to cents for the API
          subscriptionPrice: Math.round(form.subscriptionPrice * 100),
        }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Failed to save')
        return
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch {
      setError('Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" aria-label="Loading">
        <span
          className="material-symbols-outlined text-primary text-3xl animate-spin"
          aria-hidden="true"
        >
          progress_activity
        </span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">
            Edit Specialist
          </h1>
          <p className="text-outline mt-1">{specialist?.name}</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          {specialist && (
            <Button variant="secondary" size="sm" asChild>
              <a
                href={`/${specialist.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  className="material-symbols-outlined text-base"
                  aria-hidden="true"
                >
                  open_in_new
                </span>
                View Live
              </a>
            </Button>
          )}
          {specialist && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/dashboard/specialist/${specialistId}/posts/new`}>
                <span
                  className="material-symbols-outlined text-base"
                  aria-hidden="true"
                >
                  add
                </span>
                New Post
              </a>
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Basic info */}
        <section
          className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 space-y-5"
          aria-labelledby="edit-basic-heading"
        >
          <h2 id="edit-basic-heading" className="text-white font-bold">
            Basic Information
          </h2>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-specialty">Specialty</Label>
            <Input
              id="edit-specialty"
              value={form.specialty}
              onChange={(e) =>
                setForm((p) => ({ ...p, specialty: e.target.value }))
              }
              placeholder="e.g. AI Strategy"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-tagline">Tagline</Label>
            <Input
              id="edit-tagline"
              value={form.tagline}
              onChange={(e) =>
                setForm((p) => ({ ...p, tagline: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              value={form.bio}
              onChange={(e) =>
                setForm((p) => ({ ...p, bio: e.target.value }))
              }
              rows={4}
            />
          </div>
        </section>

        {/* Photo uploads */}
        <section
          className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 space-y-5"
          aria-labelledby="edit-photos-heading"
        >
          <h2 id="edit-photos-heading" className="text-white font-bold">
            Photos
          </h2>
          <div className="flex items-start gap-6">
            <div>
              <p className="text-outline text-xs mb-2">Avatar</p>
              <ImageUpload
                value={form.avatarUrl}
                onChange={(url) =>
                  setForm((p) => ({ ...p, avatarUrl: url }))
                }
                folder="avatars"
                label="Avatar"
                aspect="square"
              />
            </div>
            <div className="flex-1">
              <p className="text-outline text-xs mb-2">Cover Image</p>
              <ImageUpload
                value={form.coverUrl}
                onChange={(url) =>
                  setForm((p) => ({ ...p, coverUrl: url }))
                }
                folder="covers"
                label="Cover"
                aspect="cover"
              />
            </div>
          </div>
        </section>

        {/* Subscription pricing */}
        <section
          className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 space-y-4"
          aria-labelledby="edit-pricing-heading"
        >
          <h2 id="edit-pricing-heading" className="text-white font-bold">
            Subscription Pricing
          </h2>
          <p className="text-outline text-sm">
            You earn 85% of each subscription. Sagevu keeps 15%.
          </p>
          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-price">Monthly Price (R$)</Label>
              <Input
                id="edit-price"
                type="number"
                min={0}
                step={0.01}
                className="w-32"
                value={form.subscriptionPrice}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    subscriptionPrice: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            {form.subscriptionPrice > 0 && (
              <p className="text-outline text-sm mt-5">
                You receive{' '}
                <span className="text-white font-medium">
                  R$ {(form.subscriptionPrice * 0.85).toFixed(2)}/mo
                </span>
              </p>
            )}
          </div>
        </section>

        {/* AI system prompt — only for AI specialists */}
        {specialist?.type === 'AI' && (
          <section
            className="bg-surface-container rounded-xl p-6 border border-primary/20 space-y-4"
            aria-labelledby="edit-prompt-heading"
          >
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-primary"
                aria-hidden="true"
              >
                psychology
              </span>
              <h2 id="edit-prompt-heading" className="text-white font-bold">
                AI System Prompt
              </h2>
            </div>
            <Textarea
              id="edit-systemPrompt"
              value={form.systemPrompt}
              onChange={(e) =>
                setForm((p) => ({ ...p, systemPrompt: e.target.value }))
              }
              rows={10}
              className="font-mono text-xs"
              placeholder="Describe your AI specialist's specialistlity, expertise, and communication style..."
              aria-label="AI system prompt"
            />
          </section>
        )}

        {/* Published toggle */}
        <section className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold">Published</h2>
              <p className="text-outline text-sm mt-1">
                Visible to the public on Sagevu
              </p>
            </div>
            <Switch
              checked={form.isPublished}
              onCheckedChange={(checked) =>
                setForm((p) => ({ ...p, isPublished: checked }))
              }
              aria-label="Published status"
            />
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

        {success && (
          <div
            role="status"
            className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-primary text-sm flex items-center gap-2"
          >
            <span
              className="material-symbols-outlined text-base"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            Saved successfully
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
