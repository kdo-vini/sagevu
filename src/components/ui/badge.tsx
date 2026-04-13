import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center px-3 py-1 text-xs font-bold transition-colors', {
  variants: {
    variant: {
      default:
        'bg-primary/20 text-primary border border-primary/30 rounded-full',
      secondary:
        'bg-surface-container-high border border-outline-variant/20 text-on-surface-variant rounded-full',
      ai: 'bg-primary text-on-primary rounded-full uppercase tracking-widest shadow-lg',
      human:
        'bg-surface-container-high border border-outline-variant/20 text-on-surface-variant rounded-full uppercase tracking-widest',
      destructive:
        'bg-error/20 text-error border border-error/30 rounded-full',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
