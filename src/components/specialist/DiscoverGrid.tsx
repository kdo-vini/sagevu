'use client'
import { useState } from 'react'
import Link from 'next/link'
import { SpecialistCard } from '@/components/specialist/SpecialistCard'
import { Input } from '@/components/ui/input'
import type { Specialist } from '@/types'
import { SPECIALTY_CATEGORIES } from '@/lib/specialtyCategories'

type FilterType = 'ALL' | 'AI' | 'HUMAN'

interface DiscoverGridProps {
  specialists: Specialist[]
  subscriberCounts?: Record<string, number>
}

export function DiscoverGrid({ specialists, subscriberCounts = {} }: DiscoverGridProps) {
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('ALL')

  const filtered = specialists.filter((s) => {
    const matchesType = filter === 'ALL' || s.type === filter
    const matchesCategory = category === 'ALL' || s.specialty === category
    const matchesSearch =
      !search ||
      [s.name, s.specialty, s.tagline, s.bio].some((field) =>
        field?.toLowerCase().includes(search.toLowerCase())
      )
    return matchesType && matchesCategory && matchesSearch
  })

  const filters: { value: FilterType; label: string; icon: string }[] = [
    { value: 'ALL', label: 'All', icon: 'apps' },
    { value: 'AI', label: 'AI', icon: 'psychology' },
    { value: 'HUMAN', label: 'Human', icon: 'person' },
  ]

  return (
    <section className="max-w-6xl mx-auto" aria-label="Specialist directory">
      {/* Toolbar: heading + search + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <h2 className="text-white text-2xl font-black tracking-tight shrink-0">
          Browse Specialists
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto w-full sm:w-auto">
          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none select-none"
              aria-hidden="true"
            >
              search
            </span>
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search specialists..."
              className="pl-10"
              aria-label="Search specialists"
            />
          </div>

          {/* Filter tabs */}
          <div
            className="flex gap-2 shrink-0"
            role="tablist"
            aria-label="Filter by specialist type"
          >
            {filters.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  filter === f.value
                    ? 'text-primary border border-primary/30 bg-primary/5'
                    : 'text-outline border border-outline-variant/20 hover:text-white hover:border-outline-variant/40'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  aria-hidden="true"
                >
                  {f.icon}
                </span>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category filter pills */}
      <div
        className="flex gap-2 flex-wrap mb-6"
        role="group"
        aria-label="Filter by specialty category"
      >
        <button
          onClick={() => setCategory('ALL')}
          aria-pressed={category === 'ALL'}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
            category === 'ALL'
              ? 'bg-primary/20 border-primary text-primary'
              : 'bg-surface-container border-outline-variant/20 text-outline hover:text-white hover:border-outline-variant/40'
          }`}
        >
          All Categories
        </button>
        {SPECIALTY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            aria-pressed={category === cat}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
              category === cat
                ? 'bg-primary/20 border-primary text-primary'
                : 'bg-surface-container border-outline-variant/20 text-outline hover:text-white hover:border-outline-variant/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-24" role="status" aria-live="polite">
          <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-outline text-3xl" aria-hidden="true">
              {search ? 'search_off' : category !== 'ALL' ? 'filter_list_off' : 'explore'}
            </span>
          </div>

          {specialists.length === 0 ? (
            <>
              <h3 className="text-white font-bold text-xl mb-2">No specialists yet</h3>
              <p className="text-outline mb-6">
                Be the first to create an expert specialist on Sagevu.
              </p>
              <Link
                href="/dashboard/specialist/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">add</span>
                Create a Specialist
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-white font-bold text-xl mb-2">
                {search
                  ? `No results for \u201c${search}\u201d`
                  : `No specialists in \u201c${category}\u201d`}
              </h3>
              <p className="text-outline mb-6">
                {search
                  ? 'Try a different search term or clear your filters.'
                  : 'Try a different category or browse all specialists.'}
              </p>
              <button
                onClick={() => { setSearch(''); setFilter('ALL'); setCategory('ALL') }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold text-sm hover:border-primary/30 hover:text-white transition-all duration-200"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Result count */}
          <p className="text-outline text-sm mb-5" aria-live="polite" aria-atomic="true">
            {filtered.length === specialists.length
              ? `${specialists.length} specialist${specialists.length !== 1 ? 's' : ''}`
              : `${filtered.length} of ${specialists.length} specialist${specialists.length !== 1 ? 's' : ''}`}
          </p>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            role="list"
            aria-label="Specialist cards"
          >
            {filtered.map((specialist) => (
              <div key={specialist.id} role="listitem">
                <SpecialistCard
                  specialist={specialist}
                  subscriberCount={subscriberCounts[specialist.id]}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
