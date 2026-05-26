'use client'

import { Check, Trash2 } from 'lucide-react'
import { ActiveSet } from '@/types'
import { cn } from '@/lib/utils'

interface SetRowProps {
  set: ActiveSet
  isActive: boolean
  previousData?: { weight_kg: number; reps: number; rir: number | null } | null
  onActivate: () => void
  onToggleComplete: () => void
  onDelete: () => void
}

const SET_TYPE_LABELS: Record<string, string> = {
  warmup: 'ISI',
  working: '',
  dropset: 'DROP',
}

export function SetRow({
  set,
  isActive,
  previousData,
  onActivate,
  onToggleComplete,
  onDelete,
}: SetRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all',
        set.completed
          ? 'bg-emerald-950/40 border border-emerald-800/40'
          : isActive
          ? 'bg-indigo-950/60 border border-indigo-700/60'
          : 'bg-zinc-900 border border-zinc-800'
      )}
    >
      {/* Set numarası */}
      <div className="w-8 text-center">
        {set.set_type !== 'working' ? (
          <span className="text-xs font-bold text-zinc-400">
            {SET_TYPE_LABELS[set.set_type]}
          </span>
        ) : (
          <span className={cn('text-sm font-bold', set.completed ? 'text-emerald-400' : 'text-zinc-400')}>
            {set.set_number}
          </span>
        )}
      </div>

      {/* Önceki */}
      <div className="w-20 text-center">
        {previousData ? (
          <span className="text-xs text-zinc-600 tabular-nums">
            {previousData.weight_kg}kg×{previousData.reps}
            {previousData.rir !== null ? ` @${previousData.rir}` : ''}
          </span>
        ) : (
          <span className="text-xs text-zinc-700">—</span>
        )}
      </div>

      {/* Değerler — tıklayınca aktif eder */}
      <button
        onClick={onActivate}
        className="flex-1 flex items-center justify-center gap-2 text-left"
        disabled={set.completed}
      >
        <span className={cn('tabular-nums font-semibold', set.completed ? 'text-emerald-300' : 'text-white')}>
          {set.weight_kg}
          <span className="text-xs font-normal text-zinc-500 ml-0.5">kg</span>
        </span>
        <span className="text-zinc-600">×</span>
        <span className={cn('tabular-nums font-semibold', set.completed ? 'text-emerald-300' : 'text-white')}>
          {set.reps}
          <span className="text-xs font-normal text-zinc-500 ml-0.5">tek</span>
        </span>
        {set.rir !== null && (
          <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-md">
            RIR {set.rir}
          </span>
        )}
      </button>

      {/* Sil */}
      <button
        onClick={onDelete}
        className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-950/40 transition-all"
      >
        <Trash2 size={14} />
      </button>

      {/* Tamamla */}
      <button
        onClick={onToggleComplete}
        className={cn(
          'h-10 w-10 flex items-center justify-center rounded-xl border-2 transition-all active:scale-95',
          set.completed
            ? 'bg-emerald-600 border-emerald-500 text-white'
            : 'border-zinc-600 text-zinc-600 hover:border-emerald-500 hover:text-emerald-500'
        )}
      >
        <Check size={18} strokeWidth={2.5} />
      </button>
    </div>
  )
}
