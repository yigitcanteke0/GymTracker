'use client'

import { cn } from '@/lib/utils'

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
  const clamp = (v: number) => Math.min(max, Math.max(min, v))

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider text-center">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1">
        {quickSteps?.map(s => (
          <button
            key={`minus-${s}`}
            onClick={() => onChange(clamp(value - s))}
            className="h-12 px-2.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold text-sm
                       active:bg-zinc-700 active:scale-95 transition-all select-none"
          >
            -{s}
          </button>
        ))}

        <div className="flex-1 flex items-center gap-1">
          <button
            onClick={() => onChange(clamp(value - step))}
            className="h-12 flex-1 rounded-lg bg-zinc-800 text-zinc-200 text-xl font-bold
                       active:bg-zinc-700 active:scale-95 transition-all select-none"
          >
            −
          </button>
          <div className="min-w-[4rem] text-center">
            <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
            {unit && <span className="text-sm text-zinc-400 ml-1">{unit}</span>}
          </div>
          <button
            onClick={() => onChange(clamp(value + step))}
            className="h-12 flex-1 rounded-lg bg-zinc-800 text-zinc-200 text-xl font-bold
                       active:bg-zinc-700 active:scale-95 transition-all select-none"
          >
            +
          </button>
        </div>

        {quickSteps?.map(s => (
          <button
            key={`plus-${s}`}
            onClick={() => onChange(clamp(value + s))}
            className="h-12 px-2.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold text-sm
                       active:bg-zinc-700 active:scale-95 transition-all select-none"
          >
            +{s}
          </button>
        ))}
      </div>
    </div>
  )
}
