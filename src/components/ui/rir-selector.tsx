'use client'

import { cn } from '@/lib/utils'

const RIR_LABELS: Record<number, string> = {
  0: 'Tükenme',
  1: 'Çok zor',
  2: 'Zor',
  3: 'Orta',
  4: 'Kolay',
  5: 'Çok kolay',
}

// Effort gradient: red → emerald
const RIR_COLORS: Record<number, string> = {
  0: 'bg-red-600/90 text-white border-red-500/50 shadow-sm shadow-red-950/50',
  1: 'bg-orange-600/90 text-white border-orange-500/50 shadow-sm shadow-orange-950/50',
  2: 'bg-amber-600/90 text-white border-amber-500/50 shadow-sm shadow-amber-950/50',
  3: 'bg-yellow-600/90 text-white border-yellow-500/50 shadow-sm shadow-yellow-950/50',
  4: 'bg-lime-600/90 text-white border-lime-500/50 shadow-sm shadow-lime-950/50',
  5: 'bg-emerald-600/90 text-white border-emerald-500/50 shadow-sm shadow-emerald-950/50',
}

interface RirSelectorProps {
  value: number | null
  onChange: (v: number) => void
}

export function RirSelector({ value, onChange }: RirSelectorProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-medium text-stone-500 uppercase tracking-[0.08em]">
          RIR — Kalan Tekrar
        </span>
        {value !== null && (
          <span className="text-[11px] font-medium text-stone-400">{RIR_LABELS[value]}</span>
        )}
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4, 5].map(r => (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={cn(
              'flex-1 h-12 rounded-lg border text-base font-semibold transition-all active:scale-[0.96] select-none tnum',
              value === r
                ? RIR_COLORS[r]
                : 'bg-stone-900 border-stone-800/80 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
            )}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  )
}
