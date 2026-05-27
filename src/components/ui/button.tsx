'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.005em] transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
  {
    variants: {
      variant: {
        primary:
          'bg-accent-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.12),0_6px_16px_-4px_var(--color-accent-950),0_1px_2px_rgb(0_0_0_/_0.4)]',
        secondary:
          'bg-surface-2 text-fg shadow-[inset_0_0_0_0.5px_var(--color-border)]',
        success:
          'bg-success text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.12),0_6px_16px_-4px_rgb(5_80_50_/_0.6)]',
        danger:
          'bg-danger text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.12),0_6px_16px_-4px_rgb(120_30_30_/_0.6)]',
        ghost: 'bg-transparent text-fg-secondary',
        outline:
          'bg-transparent text-fg shadow-[inset_0_0_0_1px_var(--color-border-2)]',
        accentSoft:
          'bg-accent-soft text-accent-300 shadow-[inset_0_0_0_0.5px_var(--color-accent-border)]',
      },
      size: {
        sm: 'h-9 px-3 text-[13px] rounded-[14px]',
        md: 'h-11 px-4 text-[14px] rounded-[14px]',
        lg: 'h-13 px-5 text-[14px] rounded-[14px]',
        xl: 'h-16 px-6 text-base rounded-[14px]',
        icon: 'h-11 w-11 rounded-xl',
        'icon-sm': 'h-9 w-9 rounded-xl',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  full?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, full, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), full && 'w-full', className)}
      {...props}
    />
  )
)
Button.displayName = 'Button'
