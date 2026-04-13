import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-[0_10px_20px_-10px_rgba(108,99,255,0.4)] hover:opacity-90 hover:scale-105',
        secondary:
          'bg-surface-container-high border border-outline-variant/20 text-on-surface hover:bg-surface-variant',
        ghost:
          'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
        outline:
          'border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10',
        destructive:
          'bg-error/10 text-error border border-error/20 hover:bg-error/20',
        white:
          'bg-white text-surface-container-lowest font-black uppercase tracking-widest hover:bg-on-surface-variant',
      },
      size: {
        default: 'h-11 px-6 py-2 text-sm rounded-xl',
        sm: 'h-9 px-4 text-xs rounded-lg',
        lg: 'h-14 px-8 text-base rounded-xl',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
