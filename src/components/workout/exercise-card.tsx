'use client'

import { Plus, Check } from 'lucide-react'
import { ActiveExercise, MuscleGroup } from '@/types'
import type { PreviousSet } from '@/lib/last-performance'
import { Card } from '@/components/ui/card'
import { GlyphTile } from '@/components/glyphs/glyph'
import { exerciseGlyph } from '@/lib/glyph-map'
import { cn } from '@/lib/utils'

const RIR_COLORS = ['#dc2626', '#ea580c', '#d97706', '#a3a341', '#65a342', '#16a34a']
const rirColor = (r: number | null) => RIR_COLORS[r ?? 3] ?? '#65a342'

interface ExerciseCardProps {
  exerciseGroup: ActiveExercise
  previousSets?: PreviousSet[]
  isCurrent: boolean
  activeSetIdx: number
  onSetClick: (setIdx: number) => void
  onAddSet: () => void
  onRemove?: () => void
}

export function ExerciseCard({
  exerciseGroup,
  previousSets,
  isCurrent,
  activeSetIdx,
  onSetClick,
  onAddSet,
  onRemove,
}: ExerciseCardProps) {
  const { exercise, sets } = exerciseGroup
  const mg = exercise.muscle_group as MuscleGroup | undefined
  const done = sets.filter(s => s.completed).length
  const total = sets.length
  const glyph = exerciseGlyph(exercise.name, exercise.equipment)

  const ringDash = total > 0 ? (done / total) * (2 * Math.PI * 14) : 0

  return (
    <Card
      padding={14}
      className={cn(
        'transition-all duration-200',
        isCurrent
          ? 'bg-surface !shadow-[inset_0_0_0_1px_var(--color-accent-border),0_8px_24px_-16px_var(--color-accent-950)]'
          : '!bg-surface-dim'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2.5">
        <GlyphTile name={glyph} size={44} />
        <div className="flex-1 min-w-0">
          <div className="text-[15.5px] font-semibold text-fg tracking-[-0.01em] truncate">
            {exercise.name}
          </div>
          <div className="text-[11.5px] text-fg-tertiary mt-px">
            {mg?.name ?? ''} · {exercise.equipment}
          </div>
        </div>
        {/* Progress ring */}
        <div className="relative w-9 h-9 shrink-0">
          <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-surface-3)" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke={isCurrent ? 'var(--color-accent-500)' : 'var(--color-fg-tertiary)'}
              strokeWidth="3"
              strokeDasharray={`${ringDash} 999`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10.5px] font-bold text-fg-secondary tnum">
            {done}/{total}
          </div>
        </div>
      </div>

      {/* Set rows */}
      <div className="flex flex-col gap-0.5">
        {sets.map((s, i) => {
          const isActive = isCurrent && i === activeSetIdx
          const prev = previousSets?.[i] ?? null
          const bg = s.completed
            ? 'bg-accent-row'
            : isActive
            ? 'bg-surface-3 shadow-[inset_0_0_0_1px_var(--color-accent-border)]'
            : 'bg-transparent'

          return (
            <div
              key={i}
              onClick={() => onSetClick(i)}
              className={cn(
                'grid items-center gap-2.5 px-3 py-2 rounded-[10px] cursor-pointer transition-all',
                bg
              )}
              style={{ gridTemplateColumns: '24px 1fr auto auto' }}
            >
              {/* set tile */}
              <div
                className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold',
                  s.completed
                    ? 'bg-success text-white'
                    : isActive
                    ? 'bg-accent-600 text-white'
                    : 'bg-surface-3 text-fg-tertiary shadow-[inset_0_0_0_0.5px_var(--color-border)]'
                )}
              >
                {s.completed ? <Check size={11} strokeWidth={3} /> : i + 1}
              </div>

              {/* value or previous reference */}
              <div className="min-w-0 whitespace-nowrap overflow-hidden">
                {s.completed ? (
                  <div className="text-[14px] font-semibold text-fg tnum tracking-[-0.005em]">
                    {s.weight_kg}
                    <span className="text-fg-tertiary font-medium text-[11px]">kg</span>
                    <span className="mx-1.5 text-fg-tertiary opacity-50">×</span>
                    {s.reps}
                    <span className="text-fg-tertiary font-medium text-[11px]"> rep</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-[12px] text-fg-tertiary tnum">
                    <span className="text-[9px] font-bold tracking-[0.08em] text-fg-quaternary uppercase">
                      Önceki
                    </span>
                    {prev ? (
                      <span>
                        {prev.weight_kg}kg × {prev.reps}
                      </span>
                    ) : (
                      <span className="text-fg-quaternary">—</span>
                    )}
                  </div>
                )}
              </div>

              {/* RIR badge or active label */}
              {s.completed && s.rir !== null ? (
                <div
                  style={{
                    background: `${rirColor(s.rir)}22`,
                    color: rirColor(s.rir),
                    boxShadow: `inset 0 0 0 0.5px ${rirColor(s.rir)}33`,
                  }}
                  className="h-[22px] px-2 rounded-full inline-flex items-center text-[10.5px] font-bold tnum tracking-[0.02em]"
                >
                  RIR {s.rir}
                </div>
              ) : (
                <div />
              )}

              {isActive && !s.completed ? (
                <div className="text-[10px] font-bold text-accent-300 tracking-[0.08em] uppercase whitespace-nowrap">
                  Aktif
                </div>
              ) : (
                <div />
              )}
            </div>
          )
        })}
      </div>

      {/* Add set */}
      <button
        onClick={onAddSet}
        className="mt-1.5 h-8 w-full bg-transparent text-fg-tertiary text-[12px] font-semibold rounded-[10px] inline-flex items-center justify-center gap-1 shadow-[inset_0_0_0_0.5px_var(--color-border)] hover:text-fg-secondary transition-colors"
      >
        <Plus size={13} strokeWidth={2.5} />
        Set Ekle
      </button>

      {onRemove && (
        <button
          onClick={onRemove}
          className="mt-2 w-full text-[11px] text-fg-quaternary hover:text-danger transition-colors font-medium"
        >
          Egzersizi kaldır
        </button>
      )}
    </Card>
  )
}
