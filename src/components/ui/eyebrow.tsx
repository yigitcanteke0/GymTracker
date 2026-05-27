import { cn } from '@/lib/utils'

interface EyebrowProps {
  children: React.ReactNode
  tone?: 'muted' | 'accent'
  className?: string
}

export function Eyebrow({ children, tone = 'muted', className }: EyebrowProps) {
  return (
    <div
      className={cn(
        'text-[10.5px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap',
        tone === 'accent' ? 'text-accent-400' : 'text-fg-tertiary',
        className
      )}
    >
      {children}
    </div>
  )
}
