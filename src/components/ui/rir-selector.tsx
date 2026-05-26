'use client'

import { cn } from '@/lib/utils'

const RIR_LABELS: Record<number, string> = {
  0: '0 — Tükenme',
  1: '1 — Çok Zor',
  2: '2 — Zor',
  3: '3 — Orta',
  4: '4 — Kolay',
  5: '5 — Çok Kolay',
}

const RIR_COLORS: Record<number, string> = {
  0: 'bg-red-600 text-white border-red-500',
  1: 'bg-orange-600 text-white border-orange-500',
  2: 'bg-amber-600 text-white border-amber-500',
  3: 'bg-yellow-600 text-white border-yellow-500',
  4: 'bg-lime-600 text-white border-lime-500',
  5: 'bg-green-600 text-white border-green-500',
}

interface RirSelectorProps {
  value: number | null
  onChange: (v: number) => void
}

export function RirSelector({ value, onChange }: RirSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider text-center">
        RIR — Kalan Tekrar
      </span>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4, 5].map(r => (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={cn(
              'flex-1 h-12 rounded-lg border font-bold text-base transition-all active:scale-95 select-none',
              value === r
                ? RIR_COLORS[r]
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
            )}
          >
            {r}
          </button>
        ))}
      </div>
      {value !== null && (
        <p className="text-xs text-zinc-500 text-center">{RIR_LABELS[value]}</p>
      )}
    </div>
  )
}
