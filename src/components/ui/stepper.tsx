'use client'

import { cn } from '@/lib/utils'
import { Minus, Plus } from 'lucide-react'

interface StepperProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  unit?: string
  quickSteps?: number[]
  className?: string
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  unit,
  quickSteps,
  className,
}: StepperProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 10) / 10))

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      {label && (
        <span className="text-[11px] font-medium text-stone-500 uppercase tracking-[0.08em] text-center">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1.5">
        {quickSteps?.map(s => (
          <button
            key={`minus-${s}`}
            onClick={() => onChange(clamp(value - s))}
            className="h-12 px-2.5 rounded-lg bg-stone-900 text-stone-400 font-medium text-[13px] tnum
                       border border-stone-800/80
                       active:bg-stone-800 active:scale-[0.97] transition-all select-none"
          >
            −{s}
          </button>
        ))}

        <div className="flex-1 flex items-center gap-1.5">
          <button
            onClick={() => onChange(clamp(value - step))}
            className="h-12 flex-1 rounded-lg bg-stone-900 text-stone-200 flex items-center justify-center
                       border border-stone-800/80
                       active:bg-stone-800 active:scale-[0.97] transition-all select-none"
          >
            <Minus size={18} strokeWidth={2.5} />
          </button>
          <div className="min-w-[5rem] text-center">
            <span className="text-2xl font-semibold text-white tnum tracking-tight">{value}</span>
            {unit && <span className="text-xs text-stone-500 ml-1 font-medium">{unit}</span>}
          </div>
          <button
            onClick={() => onChange(clamp(value + step))}
            className="h-12 flex-1 rounded-lg bg-stone-900 text-stone-200 flex items-center justify-center
                       border border-stone-800/80
                       active:bg-stone-800 active:scale-[0.97] transition-all select-none"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        {quickSteps?.map(s => (
          <button
            key={`plus-${s}`}
            onClick={() => onChange(clamp(value + s))}
            className="h-12 px-2.5 rounded-lg bg-stone-900 text-stone-400 font-medium text-[13px] tnum
                       border border-stone-800/80
                       active:bg-stone-800 active:scale-[0.97] transition-all select-none"
          >
            +{s}
          </button>
        ))}
      </div>
    </div>
  )
}
