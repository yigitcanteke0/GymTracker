import { cn } from '@/lib/utils'

interface BigNumProps {
  value: string | number
  unit?: string
  tone?: 'primary' | 'accent'
  size?: number
  className?: string
}

export function BigNum({
  value,
  unit,
  tone = 'primary',
  size = 32,
  className,
}: BigNumProps) {
  return (
    <span className={cn('inline-flex items-baseline gap-1', className)}>
      <span
        style={{ fontSize: size, lineHeight: 1 }}
        className={cn(
          'font-semibold tnum tracking-[-0.025em]',
          tone === 'accent' ? 'text-accent-300' : 'text-fg'
        )}
      >
        {value}
      </span>
      {unit && (
        <span
          style={{ fontSize: size * 0.42 }}
          className="font-medium text-fg-tertiary tracking-[-0.005em]"
        >
          {unit}
        </span>
      )}
    </span>
  )
}
