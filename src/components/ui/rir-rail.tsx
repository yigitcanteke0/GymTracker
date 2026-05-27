'use client'

import { cn } from '@/lib/utils'

const RIR_COLORS = ['#dc2626', '#ea580c', '#d97706', '#a3a341', '#65a342', '#16a34a']

interface RirRailProps {
  value: number | null
  onChange: (v: number) => void
  h?: number
}

/**
 * Compact 0..5 segmented track. Six equal pills in a single rounded rail.
 * Used in the SetComposer alongside the Reps stepper.
 */
export function RirRail({ value, onChange, h = 50 }: RirRailProps) {
  return (
    <div
      style={{ height: h }}
      className="grid grid-cols-6 gap-[3px] p-1 rounded-xl bg-surface-3 shadow-[inset_0_0_0_0.5px_var(--color-border)]"
    >
      {RIR_COLORS.map((c, i) => {
        const on = i === value
        return (
          <button
            key={i}
            onClick={() => onChange(i)}
            style={{
              background: on ? c : 'transparent',
              boxShadow: on
                ? `inset 0 0 0 1px rgb(255 255 255 / 0.15), 0 2px 6px ${c}77`
                : undefined,
            }}
            className={cn(
              'rounded-lg text-[14px] font-bold tnum transition-all active:scale-[0.94] select-none',
              on ? 'text-white' : 'text-fg-tertiary hover:text-fg-secondary'
            )}
          >
            {i}
          </button>
        )
      })}
    </div>
  )
}
