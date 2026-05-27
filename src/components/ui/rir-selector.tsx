'use client'

import { cn } from '@/lib/utils'

const RIR_COLORS = ['#dc2626', '#ea580c', '#d97706', '#a3a341', '#65a342', '#16a34a']
const RIR_LABELS = ['Maks', 'Çok zor', 'Zor', 'Orta', 'Kolay', 'Çok kolay']

interface RirSelectorProps {
  value: number | null
  onChange: (v: number) => void
  compact?: boolean
}

/**
 * Standalone RIR selector — six pills with label below. For composer/dialog usage.
 */
export function RirSelector({ value, onChange, compact = false }: RirSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-6 gap-1.5">
        {RIR_COLORS.map((c, i) => {
          const on = i === value
          return (
            <button
              key={i}
              onClick={() => onChange(i)}
              style={{
                background: on ? c : undefined,
                boxShadow: on
                  ? `inset 0 0 0 1px rgb(255 255 255 / 0.15), 0 4px 12px -2px ${c}77`
                  : undefined,
              }}
              className={cn(
                'rounded-[10px] font-bold tnum transition-all active:scale-[0.96] select-none',
                compact ? 'h-9 text-sm' : 'h-11 text-base',
                on
                  ? 'text-white'
                  : 'bg-surface-3 text-fg-secondary shadow-[inset_0_0_0_0.5px_var(--color-border)]'
              )}
            >
              {i}
            </button>
          )
        })}
      </div>
      {value !== null && (
        <p className="text-[11px] text-fg-tertiary text-center font-medium tracking-[-0.005em]">
          RIR {value} · {RIR_LABELS[value]}
        </p>
      )}
    </div>
  )
}
