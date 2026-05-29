'use client'

import { Plus, Check, X } from 'lucide-react'
import { ActiveExercise, MuscleGroup } from '@/types'
import type { PreviousSet } from '@/lib/last-performance'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/ui/eyebrow'
import { GlyphTile } from '@/components/glyphs/glyph'
import { exerciseGlyph } from '@/lib/glyph-map'
import { cn } from '@/lib/utils'

const RIR_COLORS = [
  '#dc2626',
  '#ea580c',
  '#d97706',
  '#a3a341',
  '#65a342',
  '#16a34a',
]
const rirColor = (r: number | null) => RIR_COLORS[r ?? 3] ?? '#65a342'

interface ExerciseCardProps {
  exerciseGroup: ActiveExercise
  previousSets?: PreviousSet[]
  isCurrent: boolean
  activeSetIdx: number
  onSetClick: (setIdx: number) => void
  onAddSet: () => void
  /** Bir seti listeden + (varsa) DB'den kaldırır. Set tamamlanmış olsa bile. */
  onDeleteSet?: (setIdx: number) => void
  onRemove?: () => void
}

/**
 * İki sütunlu split: SOL → en son antrenmanın setleri (gri ghost),
 * SAĞ → bu antrenmanın setleri (interaktif). Sağdaki her satırın
 * yanında küçük × butonu var: yanlışlıkla eklenen seti hemen geri al.
 */
export function ExerciseCard({
  exerciseGroup,
  previousSets,
  isCurrent,
  activeSetIdx,
  onSetClick,
  onAddSet,
  onDeleteSet,
  onRemove,
}: ExerciseCardProps) {
  const { exercise, sets } = exerciseGroup
  const mg = exercise.muscle_group as MuscleGroup | undefined
  const done = sets.filter(s => s.completed).length
  const total = sets.length
  const glyph = exerciseGlyph(exercise.name, exercise.equipment)

  const ringDash = total > 0 ? (done / total) * (2 * Math.PI * 14) : 0
  const hasPrev = !!previousSets && previousSets.length > 0
  const maxRows = Math.max(sets.length, previousSets?.length ?? 0)

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
      <div className="flex items-center gap-3 mb-3">
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
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="var(--color-surface-3)"
              strokeWidth="3"
            />
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

      {/* Split: Önceki | Bugün */}
      <div className="grid grid-cols-[1fr_1.2fr] gap-2.5">
        {/* LEFT — Önceki Antrenman */}
        <div>
          <div className="pb-1.5 px-1">
            <Eyebrow>Önceki</Eyebrow>
          </div>
          {hasPrev ? (
            <div className="flex flex-col gap-0.5">
              {Array.from({ length: maxRows }).map((_, i) => {
                const p = previousSets![i]
                return (
                  <div
                    key={i}
                    className="h-9 px-2 rounded-[10px] flex items-center tnum text-[12px] text-fg-quaternary"
                  >
                    {p ? (
                      <span className="truncate">
                        <span className="text-fg-tertiary font-bold mr-1.5">
                          {i + 1}
                        </span>
                        {p.weight_kg}
                        <span className="text-[10px] mx-0.5">kg</span>×{p.reps}
                        {p.rir !== null && (
                          <span className="ml-1.5 opacity-70">R{p.rir}</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-fg-quaternary/50">·</span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-9 px-2 flex items-center text-[11px] text-fg-quaternary">
              Geçmiş yok
            </div>
          )}
        </div>

        {/* RIGHT — Bugün */}
        <div>
          <div className="pb-1.5 px-1">
            <Eyebrow>Bugün</Eyebrow>
          </div>
          <div className="flex flex-col gap-0.5">
            {sets.map((s, i) => {
              const isActive = isCurrent && i === activeSetIdx
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
                    'group h-9 px-1.5 rounded-[10px] cursor-pointer transition-all flex items-center gap-1.5',
                    bg
                  )}
                >
                  {/* set # / check */}
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0',
                      s.completed
                        ? 'bg-success text-white'
                        : isActive
                        ? 'bg-accent-600 text-white'
                        : 'bg-surface-3 text-fg-tertiary shadow-[inset_0_0_0_0.5px_var(--color-border)]'
                    )}
                  >
                    {s.completed ? <Check size={9} strokeWidth={3.5} /> : i + 1}
                  </div>

                  {/* values */}
                  <div className="flex-1 min-w-0 tnum text-[12.5px] font-semibold text-fg whitespace-nowrap overflow-hidden">
                    {s.completed || isActive ? (
                      <>
                        {s.weight_kg}
                        <span className="text-[10px] text-fg-tertiary font-medium mx-0.5">
                          kg
                        </span>
                        ×{s.reps}
                        {s.rir !== null && (
                          <span
                            style={{ color: rirColor(s.rir) }}
                            className="ml-1.5 text-[10px] font-bold"
                          >
                            R{s.rir}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-fg-quaternary text-[11px]">— · —</span>
                    )}
                  </div>

                  {/* delete × — always visible at low opacity, full on hover */}
                  {onDeleteSet && (
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        onDeleteSet(i)
                      }}
                      aria-label="Seti sil"
                      className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-fg-quaternary/60 hover:text-danger hover:bg-danger/10 active:scale-90 transition-all"
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add set — full width below the split */}
      <button
        onClick={onAddSet}
        className="mt-2.5 h-8 w-full bg-transparent text-fg-tertiary text-[12px] font-semibold rounded-[10px] inline-flex items-center justify-center gap-1 shadow-[inset_0_0_0_0.5px_var(--color-border)] hover:text-fg-secondary transition-colors"
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
