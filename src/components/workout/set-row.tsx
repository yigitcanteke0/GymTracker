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
  warmup: 'W',
  working: '',
  dropset: 'D',
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
        'group flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-150',
        set.completed
          ? 'bg-emerald-950/30 border border-emerald-900/40'
          : isActive
          ? 'bg-accent-950/50 border border-accent-800/50 shadow-sm shadow-accent-950/40'
          : 'bg-stone-900/60 border border-stone-800/70 hover:border-stone-700'
      )}
    >
      {/* Set numarası */}
      <div className="w-7 text-center shrink-0">
        {set.set_type !== 'working' ? (
          <span className="text-[11px] font-bold text-stone-500 tracking-wider">
            {SET_TYPE_LABELS[set.set_type]}
          </span>
        ) : (
          <span
            className={cn(
              'text-sm font-semibold tnum',
              set.completed ? 'text-emerald-400' : 'text-stone-400'
            )}
          >
            {set.set_number}
          </span>
        )}
      </div>

      {/* Önceki */}
      <div className="w-[72px] text-center shrink-0">
        {previousData ? (
          <span className="text-[11px] text-stone-600 tnum leading-tight">
            {previousData.weight_kg}×{previousData.reps}
            {previousData.rir !== null ? (
              <span className="text-stone-700"> · {previousData.rir}</span>
            ) : null}
          </span>
        ) : (
          <span className="text-[11px] text-stone-700">—</span>
        )}
      </div>

      {/* Değerler */}
      <button
        onClick={onActivate}
        className="flex-1 flex items-center justify-center gap-2 text-left disabled:pointer-events-none"
        disabled={set.completed}
      >
        <span
          className={cn(
            'tnum font-semibold text-[15px]',
            set.completed ? 'text-emerald-300' : 'text-white'
          )}
        >
          {set.weight_kg}
          <span className="text-[10px] font-normal text-stone-500 ml-0.5">kg</span>
        </span>
        <span className="text-stone-600 text-sm">×</span>
        <span
          className={cn(
            'tnum font-semibold text-[15px]',
            set.completed ? 'text-emerald-300' : 'text-white'
          )}
        >
          {set.reps}
        </span>
        {set.rir !== null && (
          <span className="text-[10px] font-medium text-stone-400 bg-stone-800/80 px-1.5 py-0.5 rounded">
            RIR {set.rir}
          </span>
        )}
      </button>

      {/* Sil */}
      <button
        onClick={onDelete}
        className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-600 hover:text-red-400 hover:bg-red-950/40 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <Trash2 size={14} />
      </button>

      {/* Tamamla */}
      <button
        onClick={onToggleComplete}
        className={cn(
          'h-10 w-10 flex items-center justify-center rounded-xl border-2 transition-all active:scale-90 shrink-0',
          set.completed
            ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-950/50'
            : 'border-stone-700 text-stone-700 hover:border-emerald-600 hover:text-emerald-500'
        )}
      >
        <Check size={18} strokeWidth={3} />
      </button>
    </div>
  )
}
