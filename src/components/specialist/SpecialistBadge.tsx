import { Badge } from '@/components/ui/badge'
import type { SpecialistType } from '@/types'

interface SpecialistBadgeProps {
  type: SpecialistType
  size?: 'sm' | 'default'
}

export function SpecialistBadge({ type, size = 'default' }: SpecialistBadgeProps) {
  if (type === 'AI') {
    return (
      <Badge
        variant="ai"
        className={`flex items-center gap-1 ${size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : ''}`}
        aria-label="AI Enhanced creator"
        title="AI avatar, human-driven content"
      >
        <span className="material-symbols-outlined text-[1em]">psychology</span>
        AI Enhanced
      </Badge>
    )
  }
  return null // Humans don't need a badge unless explicitly requested
}
