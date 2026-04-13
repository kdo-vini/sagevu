import { Badge } from '@/components/ui/badge'
import type { PersonaType } from '@/types'

interface PersonaBadgeProps {
  type: PersonaType
  size?: 'sm' | 'default'
}

export function PersonaBadge({ type, size = 'default' }: PersonaBadgeProps) {
  if (type === 'AI') {
    return (
      <Badge
        variant="ai"
        className={size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}
        aria-label="AI persona"
      >
        AI
      </Badge>
    )
  }
  return (
    <Badge
      variant="human"
      className={size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}
      aria-label="Human persona"
    >
      Human
    </Badge>
  )
}
