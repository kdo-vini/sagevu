'use client'
import { useState } from 'react'
import { SpecialistCard } from '@/components/specialist/SpecialistCard'
import type { Specialist } from '@/types'

type FilterType = 'ALL' | 'AI' | 'HUMAN'

interface DiscoverGridProps {
  specialists: Specialist[]
}

export function DiscoverGrid({ specialists }: DiscoverGridProps) {
  const [filter, setFilter] = useState<FilterType>('ALL')

  const filtered =
    filter === 'ALL'
      ? specialists
      : specialists.filter((p) => p.type === filter)

  const filters: { value: FilterType; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'AI', label: 'AI' },
    { value: 'HUMAN', label: 'Human' },
  ]

  return (
    <section className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-white text-2xl font-black tracking-tight">
          Discover Specialists
        </h2>
        <div className="flex gap-3" role="tablist" aria-label="Filter specialists">
          {filters.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                filter === f.value
                  ? 'text-primary border border-primary/30 bg-primary/5'
                  : 'text-outline border border-outline-variant/20 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-outline text-3xl">
              explore
            </span>
          </div>
          <h3 className="text-white font-bold text-xl mb-2">
            {filter === 'ALL' ? 'No specialists yet' : `No ${filter} specialists yet`}
          </h3>
          <p className="text-outline mb-6">
            {filter === 'ALL'
              ? 'Be the first to create an expert specialist on Sagevu.'
              : `Try switching filters to discover other specialists.`}
          </p>
          {filter === 'ALL' && (
            <a
              href="/dashboard/specialist/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-base">
                add
              </span>
              Create a Specialist
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((specialist) => (
            <SpecialistCard key={specialist.id} specialist={specialist} />
          ))}
        </div>
      )}
    </section>
  )
}
