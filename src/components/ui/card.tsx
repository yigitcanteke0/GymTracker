import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: number | string
}

/**
 * Surface card with inset border + subtle highlight.
 * Tokens: `bg-surface`, `rounded-[18px]`, inset 0.5px border shadow.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 16, style, children, ...rest }, ref) => (
    <div
      ref={ref}
      style={{ padding, ...style }}
      className={cn(
        'bg-surface rounded-[18px]',
        'shadow-[inset_0_0_0_0.5px_var(--color-border),inset_0_1px_0_rgb(255_255_255_/_0.02)]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
)
Card.displayName = 'Card'
