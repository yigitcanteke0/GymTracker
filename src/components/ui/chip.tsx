'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  size?: 'sm' | 'md'
}

export function Chip({
  active,
  size = 'md',
  className,
  children,
  ...rest
}: ChipProps) {
  return (
    <button
      {...rest}
      className={cn(
        'shrink-0 inline-flex items-center justify-center rounded-full font-semibold text-[12.5px] whitespace-nowrap transition-all duration-150 active:scale-[0.97] tracking-[-0.005em]',
        size === 'sm' ? 'h-7 px-3' : 'h-8 px-3.5',
        active
          ? 'bg-fg text-bg'
          : 'bg-surface-2 text-fg-secondary shadow-[inset_0_0_0_0.5px_var(--color-border)] hover:text-fg',
        className
      )}
    >
      {children}
    </button>
  )
}
