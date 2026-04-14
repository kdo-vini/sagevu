import { Badge } from '@/components/ui/badge'
import type { SpecialistType } from '@/types'

interface SpecialistBadgeProps {
  type: SpecialistType
  size?: 'sm' | 'default'
}

export function SpecialistBadge({ type, size = 'default' }: SpecialistBadgeProps) {
  if (type === 'AI') {
    if (size === 'sm') {
      // Tiny icon-only dot — sits in avatar corner without covering the face
      return (
        <span
          className="flex items-center justify-center w-4 h-4 rounded-full bg-surface-container border border-primary/50 text-primary shadow-sm"
          aria-label="AI Specialist"
          title="AI Specialist"
        >
          <span className="material-symbols-outlined text-[10px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>
            psychology
          </span>
        </span>
      )
    }

    // Full badge for profile pages
    return (
      <Badge
        variant="ai"
        className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold"
        aria-label="AI Specialist"
        title="AI Specialist — powered by GPT-4o"
      >
        <span className="material-symbols-outlined text-[14px]">psychology</span>
        AI Specialist
      </Badge>
    )
  }
  return null
}
