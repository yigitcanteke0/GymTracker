'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none select-none',
  {
    variants: {
      variant: {
        primary:   'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700',
        secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-900',
        success:   'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700',
        danger:    'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
        ghost:     'bg-transparent text-zinc-300 hover:bg-zinc-800 active:bg-zinc-900',
        outline:   'border border-zinc-700 text-zinc-200 hover:bg-zinc-800 bg-transparent',
      },
      size: {
        sm:   'h-9  px-3  text-sm  gap-1.5',
        md:   'h-11 px-4  text-base gap-2',
        lg:   'h-14 px-6  text-lg  gap-2',
        xl:   'h-16 px-8  text-xl  gap-2',
        icon: 'h-11 w-11',
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
