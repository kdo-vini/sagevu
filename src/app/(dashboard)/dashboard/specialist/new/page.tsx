'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { generateSlug } from '@/lib/utils'
import { SPECIALTY_CATEGORIES } from '@/lib/specialtyCategories'

interface FormState {
  name: string
  slug: string
  bio: string
  specialty: string
  tagline: string
  type: 'HUMAN' | 'AI'
  systemPrompt: string
  subscriptionPrice: number
  isPublished: boolean
  avatarUrl: string
  coverUrl: string
}

export default function NewSpecialistPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>({
    name: '',
    slug: '',
    bio: '',
    specialty: '',
    tagline: '',
    type: 'HUMAN',
    systemPrompt: '',
    subscriptionPrice: 0,
    isPublished: false,
    avatarUrl: '',
    coverUrl: '',
  })

  function handleNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/specialists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          // API expects cents; convert dollars entered by user
          subscriptionPrice: Math.round(form.subscriptionPrice * 100),
        }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Failed to create specialist')
        return
      }
      const specialist = (await res.json()) as { id: string }
      router.push(`/dashboard/specialist/${specialist.id}/edit`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-white">
          Create a Specialist
        </h1>
        <p className="text-outline mt-1">
          Build your expert presence on Sagevu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* Type toggle */}
        <section
          className="bg-surface-container rounded-xl p-6 border border-outline-variant/10"
          aria-labelledby="type-heading"
        >
          <h2
            id="type-heading"
            className="text-white font-bold mb-4"
          >
            Specialist Type
          </h2>
          <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-labelledby="type-heading">
            {(['HUMAN', 'AI'] as const).map((type) => (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={form.type === type}
                onClick={() => setForm((prev) => ({ ...prev, type }))}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  form.type === type
                    ? 'border-primary bg-primary/10'
                    : 'border-outline-variant/20 bg-surface-container-high hover:border-outline-variant/40'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="material-symbols-outlined text-primary"
                    aria-hidden="true"
                  >
                    {type === 'AI' ? 'smart_toy' : 'person'}
                  </span>
                  <span className="text-white font-bold">
                    {type === 'AI' ? 'AI Specialist' : 'Human Expert'}
                  </span>
                </div>
                <p className="text-outline text-xs">
                  {type === 'AI'
                    ? 'An AI character powered by GPT-4o. Responds automatically.'
                    : 'You respond specialistlly to subscriber messages.'}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Basic info */}
        <section
          className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 space-y-5"
          aria-labelledby="basic-heading"
        >
          <h2 id="basic-heading" className="text-white font-bold">
            Basic Information
          </h2>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Julian Thorne"
              required
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-outline text-sm select-none">
                sagevu.com/
              </span>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="julian-thorne"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <select
              id="specialty"
              value={form.specialty}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, specialty: e.target.value }))
              }
              className="flex h-10 w-full rounded-xl border border-outline-variant/20 bg-surface-container-high px-3 py-2 text-sm text-white placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled className="bg-surface-container-high text-outline">
                Select a category...
              </option>
              {SPECIALTY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-surface-container-high text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={form.tagline}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tagline: e.target.value }))
              }
              placeholder="A one-line description of what you offer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Tell subscribers about your background, expertise, and what they'll get..."
              rows={4}
            />
          </div>
        </section>

        {/* Photo uploads */}
        <section
          className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 space-y-5"
          aria-labelledby="photos-heading"
        >
          <h2 id="photos-heading" className="text-white font-bold">
            Photos
          </h2>
          <div className="flex items-start gap-6">
            <div>
              <p className="text-outline text-xs mb-2">Avatar</p>
              <ImageUpload
                value={form.avatarUrl}
                onChange={(url) =>
                  setForm((prev) => ({ ...prev, avatarUrl: url }))
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
                  setForm((prev) => ({ ...prev, coverUrl: url }))
                }
                folder="covers"
                label="Cover"
                aspect="cover"
              />
            </div>
          </div>
        </section>

        {/* AI System Prompt — only shown for AI type */}
        {form.type === 'AI' && (
          <section
            className="bg-surface-container rounded-xl p-6 border border-primary/20 space-y-4"
            aria-labelledby="system-prompt-heading"
          >
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-primary"
                aria-hidden="true"
              >
                psychology
              </span>
              <h2 id="system-prompt-heading" className="text-white font-bold">
                AI Specialistlity &amp; System Prompt
              </h2>
            </div>
            <p className="text-outline text-sm">
              Define how your AI specialist thinks, speaks, and responds. This
              prompt is private and never shown to subscribers.
            </p>
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt *</Label>
              <Textarea
                id="systemPrompt"
                value={form.systemPrompt}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    systemPrompt: e.target.value,
                  }))
                }
                placeholder={`You are Julian Thorne, a Synthetic Intelligence Strategist with deep expertise in AI systems, quantum computing theory, and organizational transformation.

Your communication style:
- Speak with confident authority but remain open to nuance
- Use precise technical terminology but always explain it accessibly
- Draw on cross-disciplinary thinking — you see patterns others miss
- Challenge assumptions, encourage systems thinking

You help subscribers understand: AI strategy, emerging tech, futures research, and how to apply these to their work or life.`}
                rows={10}
                className="font-mono text-xs"
              />
            </div>
          </section>
        )}

        {/* Pricing */}
        <section
          className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 space-y-4"
          aria-labelledby="pricing-heading"
        >
          <h2 id="pricing-heading" className="text-white font-bold">
            Subscription Pricing
          </h2>
          <div className="space-y-2">
            <Label htmlFor="price">Monthly Price (USD)</Label>
            <div className="flex items-center gap-2">
              <span className="text-outline text-sm select-none">$</span>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.subscriptionPrice}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    subscriptionPrice: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="19.99"
                className="w-32"
              />
              <span className="text-outline text-sm select-none">/month</span>
            </div>
            <p className="text-outline text-xs">Set to $0 for a free specialist</p>
          </div>
        </section>

        {/* Publish toggle */}
        <section className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold">Publish Specialist</h2>
              <p className="text-outline text-sm mt-1">
                Make your specialist visible to the public
              </p>
            </div>
            <Switch
              checked={form.isPublished}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, isPublished: checked }))
              }
              aria-label="Publish specialist"
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

        <div className="flex gap-4 pt-2">
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
                Creating...
              </>
            ) : (
              'Create Specialist'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
