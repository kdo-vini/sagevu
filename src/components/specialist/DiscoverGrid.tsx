'use client'
import { useState } from 'react'
import Link from 'next/link'
import { SpecialistCard } from '@/components/specialist/SpecialistCard'
import { Input } from '@/components/ui/input'
import type { Specialist } from '@/types'

type FilterType = 'ALL' | 'AI' | 'HUMAN'

interface DiscoverGridProps {
  specialists: Specialist[]
  subscriberCounts?: Record<string, number>
}

export function DiscoverGrid({ specialists, subscriberCounts = {} }: DiscoverGridProps) {
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [search, setSearch] = useState('')

  const filtered = specialists.filter((s) => {
    const matchesType = filter === 'ALL' || s.type === filter
    const matchesSearch =
      !search ||
      [s.name, s.specialty, s.tagline, s.bio].some((field) =>
        field?.toLowerCase().includes(search.toLowerCase())
      )
    return matchesType && matchesSearch
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

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-24" role="status" aria-live="polite">
          <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-outline text-3xl" aria-hidden="true">
              {search ? 'search_off' : 'explore'}
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
                No results for &ldquo;{search}&rdquo;
              </h3>
              <p className="text-outline mb-6">
                Try a different search term or clear your search.
              </p>
              <button
                onClick={() => { setSearch(''); setFilter('ALL') }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold text-sm hover:border-primary/30 hover:text-white transition-all duration-200"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
                Clear search
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
