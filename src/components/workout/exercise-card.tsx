'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, Plus, GripVertical, Check } from 'lucide-react'
import { ActiveExercise, ActiveSet, SetType, MuscleGroup } from '@/types'
import { SetRow } from './set-row'
import { Stepper } from '@/components/ui/stepper'
import { RirSelector } from '@/components/ui/rir-selector'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ExerciseCardProps {
  exerciseGroup: ActiveExercise
  previousSets?: { weight_kg: number; reps: number; rir: number | null }[]
  onChange: (updated: ActiveExercise) => void
  onRemove: () => void
}

export function ExerciseCard({
  exerciseGroup,
  previousSets,
  onChange,
  onRemove,
}: ExerciseCardProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeSetIndex, setActiveSetIndex] = useState<number | null>(
    exerciseGroup.sets.findIndex(s => !s.completed)
  )

  const updateSet = useCallback(
    (idx: number, patch: Partial<ActiveSet>) => {
      const sets = exerciseGroup.sets.map((s, i) => (i === idx ? { ...s, ...patch } : s))
      onChange({ ...exerciseGroup, sets })
    },
    [exerciseGroup, onChange]
  )

  const addSet = useCallback(() => {
    const last = exerciseGroup.sets[exerciseGroup.sets.length - 1]
    const newSet: ActiveSet = {
      exercise_order: exerciseGroup.exercise_order,
      set_number: exerciseGroup.sets.length + 1,
      weight_kg: last?.weight_kg ?? 0,
      reps: last?.reps ?? 10,
      rir: last?.rir ?? 2,
      set_type: 'working' as SetType,
      completed: false,
    }
    const sets = [...exerciseGroup.sets, newSet]
    onChange({ ...exerciseGroup, sets })
    setActiveSetIndex(sets.length - 1)
  }, [exerciseGroup, onChange])

  const deleteSet = useCallback(
    (idx: number) => {
      const sets = exerciseGroup.sets
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, set_number: i + 1 }))
      onChange({ ...exerciseGroup, sets })
      if (activeSetIndex !== null && activeSetIndex >= sets.length) {
        setActiveSetIndex(sets.length - 1)
      }
    },
    [exerciseGroup, onChange, activeSetIndex]
  )

  const toggleComplete = useCallback(
    (idx: number) => {
      const set = exerciseGroup.sets[idx]
      updateSet(idx, { completed: !set.completed })
      if (!set.completed) {
        const nextIdx = exerciseGroup.sets.findIndex(
          (s, i) => i > idx && !s.completed
        )
        setActiveSetIndex(nextIdx === -1 ? null : nextIdx)
      }
    },
    [exerciseGroup, updateSet]
  )

  const activeSet = activeSetIndex !== null ? exerciseGroup.sets[activeSetIndex] : null
  const completedCount = exerciseGroup.sets.filter(s => s.completed).length
  const totalCount = exerciseGroup.sets.length
  const mg = exerciseGroup.exercise.muscle_group as MuscleGroup | undefined

  return (
    <div className="bg-stone-900/60 rounded-2xl border border-stone-800/80 overflow-hidden shadow-lg shadow-stone-950/20">
      {/* Card header */}
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <GripVertical size={16} className="text-stone-600 shrink-0" />
        <span className="text-xl shrink-0">{exerciseGroup.exercise.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-stone-50 font-medium text-[15px] truncate leading-tight">
            {exerciseGroup.exercise.name}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1.5">
            <span className="tnum">
              {completedCount}/{totalCount} set
            </span>
            {mg && (
              <>
                <span className="text-stone-700">·</span>
                <span>{mg.name}</span>
              </>
            )}
          </p>
        </div>
        {completedCount === totalCount && totalCount > 0 && (
          <div className="h-6 w-6 rounded-full bg-emerald-600/20 flex items-center justify-center">
            <Check size={12} className="text-emerald-400" strokeWidth={3} />
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-800 hover:text-stone-300 transition-colors"
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Set listesi */}
          <div className="px-2.5 space-y-1.5 pb-3">
            {/* Kolon başlıkları */}
            <div className="flex items-center gap-2 px-3 pb-0.5">
              <div className="w-7 text-center text-[10px] text-stone-600 uppercase tracking-wider font-medium">
                Set
              </div>
              <div className="w-[72px] text-center text-[10px] text-stone-600 uppercase tracking-wider font-medium">
                Önceki
              </div>
              <div className="flex-1 text-center text-[10px] text-stone-600 uppercase tracking-wider font-medium">
                kg × tekrar
              </div>
              <div className="w-8" />
              <div className="w-10" />
            </div>

            {exerciseGroup.sets.map((set, idx) => (
              <SetRow
                key={idx}
                set={set}
                isActive={activeSetIndex === idx}
                previousData={previousSets?.[idx] ?? null}
                onActivate={() => !set.completed && setActiveSetIndex(idx)}
                onToggleComplete={() => toggleComplete(idx)}
                onDelete={() => deleteSet(idx)}
              />
            ))}

            <button
              onClick={addSet}
              className="w-full flex items-center justify-center gap-1.5 h-10 mt-1 rounded-xl border border-dashed border-stone-800 text-stone-500 hover:border-stone-600 hover:text-stone-300 hover:bg-stone-900/40 transition-all text-[13px] font-medium"
            >
              <Plus size={14} />
              Set Ekle
            </button>
          </div>

          {/* Aktif set input paneli */}
          {activeSet && !activeSet.completed && (
            <div className="border-t border-stone-800/70 bg-stone-950/40 px-4 py-4 space-y-4 animate-fade-up">
              <p className="text-[11px] text-stone-500 font-medium uppercase tracking-[0.08em] text-center">
                Set {activeSetIndex! + 1} · Değerleri Gir
              </p>

              <Stepper
                label="Ağırlık"
                unit="kg"
                value={activeSet.weight_kg}
                onChange={v => updateSet(activeSetIndex!, { weight_kg: v })}
                min={0}
                max={500}
                step={2.5}
                quickSteps={[5]}
              />

              <Stepper
                label="Tekrar"
                value={activeSet.reps}
                onChange={v => updateSet(activeSetIndex!, { reps: v })}
                min={1}
                max={100}
                step={1}
              />

              <RirSelector
                value={activeSet.rir}
                onChange={v => updateSet(activeSetIndex!, { rir: v })}
              />

              <Button
                variant="success"
                size="lg"
                className="w-full"
                onClick={() => toggleComplete(activeSetIndex!)}
              >
                <Check size={18} strokeWidth={2.5} />
                Set Tamamla
              </Button>
            </div>
          )}

          {/* Egzersizi kaldır */}
          <div className="border-t border-stone-800/70 px-4 py-2 flex justify-end">
            <button
              onClick={onRemove}
              className="text-[11px] text-stone-600 hover:text-red-400 transition-colors font-medium"
            >
              Egzersizi kaldır
            </button>
          </div>
        </>
      )}
    </div>
  )
}
