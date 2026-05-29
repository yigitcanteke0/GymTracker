'use client'

import { Check } from 'lucide-react'
import type { ActiveExercise, ActiveSet } from '@/types'
import type { PreviousSet } from '@/lib/last-performance'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { Stepper } from '@/components/ui/stepper'
import { RirRail } from '@/components/ui/rir-rail'

interface SetComposerProps {
  exerciseGroup: ActiveExercise
  setIdx: number
  previousSets?: PreviousSet[]
  resting: boolean
  restRemain: number
  onSkipRest: () => void
  onUpdate: (patch: Partial<ActiveSet>) => void
  onComplete: () => void
}

/**
 * Thumb-zone bottom composer. Holds KG stepper, Reps stepper + RIR rail row,
 * and the Complete CTA. Switches to an ambient breath-circle rest timer
 * when `resting === true`.
 */
export function SetComposer({
  exerciseGroup,
  setIdx,
  previousSets,
  resting,
  restRemain,
  onSkipRest,
  onUpdate,
  onComplete,
}: SetComposerProps) {
  const set = exerciseGroup.sets[setIdx]
  if (!set) return null

  const prev = previousSets?.[setIdx] ?? null

  return (
    <div
      className="sticky bottom-0 z-10 bg-bg shadow-[0_-8px_24px_rgb(0_0_0_/_0.3)]"
      style={{ borderTop: '0.5px solid var(--color-border)' }}
    >
      {/* Ambient breath behind composer when resting */}
      {resting && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute left-1/2 top-1/2 w-[600px] h-[600px] rounded-full animate-breathe"
            style={{
              background:
                'radial-gradient(circle, var(--color-accent-950) 0%, transparent 60%)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      )}

      <div className="relative px-3 pt-2.5 flex flex-col gap-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.875rem)]">
        {/* Top strip: rest timer OR set context */}
        {resting ? (
          <div className="flex items-center justify-between px-1 pt-1">
            <div>
              <Eyebrow tone="accent">Dinlenme</Eyebrow>
              <div className="text-[24px] font-semibold text-fg tnum tracking-[-0.02em] mt-0.5">
                {Math.floor(restRemain / 60)}:{String(restRemain % 60).padStart(2, '0')}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={onSkipRest}>
              Dinlenmeyi atla
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-0.5 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-500 shadow-[0_0_8px_var(--color-accent-500)] animate-pulse-dot shrink-0" />
            <div className="flex-1 min-w-0 flex items-baseline gap-2 whitespace-nowrap overflow-hidden">
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-fg-tertiary">
                Set {setIdx + 1}/{exerciseGroup.sets.length}
              </span>
              <span className="text-[12px] text-fg-tertiary truncate">
                {exerciseGroup.exercise.name}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 shrink-0">
              {prev ? (
                <span className="text-[11px] text-fg-tertiary tnum">
                  <span className="text-fg-quaternary">önceki </span>
                  {prev.weight_kg}×{prev.reps}
                </span>
              ) : (
                <span className="text-[11px] text-fg-quaternary">—</span>
              )}
              {prev && (
                <button
                  onClick={() =>
                    onUpdate({
                      weight_kg: prev.weight_kg,
                      reps: prev.reps,
                      rir: prev.rir ?? 2,
                    })
                  }
                  className="px-2 h-[22px] rounded-md bg-accent-soft text-accent-300 text-[9.5px] font-bold tracking-[0.06em] uppercase whitespace-nowrap shadow-[inset_0_0_0_0.5px_var(--color-accent-border)] active:scale-95 transition-transform"
                >
                  Eşle
                </button>
              )}
            </div>
          </div>
        )}

        {/* KG */}
        <div className="flex flex-col gap-1">
          <div className="px-1">
            <Eyebrow>Ağırlık</Eyebrow>
          </div>
          <Stepper
            value={set.weight_kg}
            step={2.5}
            quickStep={5}
            unit="kg"
            h={50}
            accent
            onChange={(v) => onUpdate({ weight_kg: v })}
          />
        </div>

        {/* Reps + RIR */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <div className="px-1">
              <Eyebrow>Tekrar</Eyebrow>
            </div>
            <Stepper
              value={set.reps}
              step={1}
              unit="rep"
              h={50}
              onChange={(v) => onUpdate({ reps: v })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="px-1">
              <Eyebrow>RIR</Eyebrow>
            </div>
            <RirRail value={set.rir} onChange={(v) => onUpdate({ rir: v })} />
          </div>
        </div>

        {/* Complete CTA */}
        <Button variant="primary" size="lg" full onClick={onComplete} className="mt-0.5">
          <Check size={16} strokeWidth={2.5} />
          Set&apos;i Tamamla
        </Button>
      </div>
    </div>
  )
}
