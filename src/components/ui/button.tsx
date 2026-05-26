'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950',
  {
    variants: {
      variant: {
        primary:   'bg-accent-600 text-white hover:bg-accent-500 active:bg-accent-700 shadow-sm shadow-accent-950/40',
        secondary: 'bg-stone-800 text-stone-100 hover:bg-stone-700 active:bg-stone-900 border border-stone-700/60',
        success:   'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-sm shadow-emerald-950/40',
        danger:    'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
        ghost:     'bg-transparent text-stone-300 hover:bg-stone-800/70 active:bg-stone-900',
        outline:   'border border-stone-700 text-stone-200 hover:bg-stone-900 hover:border-stone-600 bg-transparent',
      },
      size: {
        sm:   'h-9  px-3.5 text-sm   gap-1.5',
        md:   'h-11 px-4   text-[15px] gap-2',
        lg:   'h-13 px-5   text-[15px] gap-2 h-[52px]',
        xl:   'h-16 px-6   text-base  gap-2',
        icon: 'h-11 w-11',
        'icon-sm': 'h-9 w-9',
        'icon-lg': 'h-14 w-14',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Button.displayName = 'Button'
