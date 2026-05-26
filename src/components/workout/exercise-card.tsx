'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, Plus, GripVertical } from 'lucide-react'
import { ActiveExercise, ActiveSet, SetType } from '@/types'
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
        // Tamamlandı — bir sonraki tamamlanmamış seti aktif et
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

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <GripVertical size={18} className="text-zinc-600 shrink-0" />
        <span className="text-2xl">{exerciseGroup.exercise.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{exerciseGroup.exercise.name}</p>
          <p className="text-xs text-zinc-500">
            {completedCount}/{totalCount} set
            {exerciseGroup.exercise.muscle_group && (
              <> · {(exerciseGroup.exercise.muscle_group as { icon?: string; name?: string })?.name}</>
            )}
          </p>
        </div>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800"
        >
          {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Set listesi */}
          <div className="px-3 space-y-1.5 pb-3">
            {/* Kolon başlıkları */}
            <div className="flex items-center gap-2 px-3 py-1">
              <div className="w-8 text-center text-xs text-zinc-600">Set</div>
              <div className="w-20 text-center text-xs text-zinc-600">Önceki</div>
              <div className="flex-1 text-center text-xs text-zinc-600">Ağırlık × Tekrar</div>
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
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all text-sm"
            >
              <Plus size={16} />
              Set Ekle
            </button>
          </div>

          {/* Aktif set input paneli */}
          {activeSet && !activeSet.completed && (
            <div className="border-t border-zinc-800 bg-zinc-950/50 px-4 py-4 space-y-4">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                Set {activeSetIndex! + 1} — Değerleri gir
              </p>

              <Stepper
                label="Ağırlık"
                unit="kg"
                value={activeSet.weight_kg}
                onChange={v => updateSet(activeSetIndex!, { weight_kg: v })}
                min={0}
                max={500}
                step={2.5}
                quickSteps={[5, 2.5]}
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
                ✓ Set Tamamla
              </Button>
            </div>
          )}

          {/* Egzersizi kaldır */}
          <div className="border-t border-zinc-800 px-4 py-2 flex justify-end">
            <button
              onClick={onRemove}
              className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
            >
              Egzersizi kaldır
            </button>
          </div>
        </>
      )}
    </div>
  )
}
