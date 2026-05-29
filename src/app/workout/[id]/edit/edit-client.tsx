'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Trash2, FileEdit } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ActiveExercise, ActiveSet, Exercise, SetType } from '@/types'
import { ExerciseCard } from '@/components/workout/exercise-card'
import { ExercisePicker } from '@/components/workout/exercise-picker'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { LongPressButton } from '@/components/ui/long-press-button'
import { Stepper } from '@/components/ui/stepper'
import { RirRail } from '@/components/ui/rir-rail'

interface EditWorkoutClientProps {
  workoutId: string
  initialName: string
  initialExercises: ActiveExercise[]
}

export function EditWorkoutClient({
  workoutId,
  initialName,
  initialExercises,
}: EditWorkoutClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [workoutName, setWorkoutName] = useState(initialName)
  const [exercises, setExercises] = useState<ActiveExercise[]>(initialExercises)
  const [editing, setEditing] = useState<{ block: number; setIdx: number } | null>(
    initialExercises.length > 0 ? { block: 0, setIdx: 0 } : null
  )
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSelectExercise = useCallback(
    (exercise: Exercise) => {
      setExercises(prev => {
        const order = prev.length + 1
        const last = prev[prev.length - 1]?.sets.slice(-1)[0]
        const newExercise: ActiveExercise = {
          exercise,
          exercise_order: order,
          sets: [
            {
              exercise_order: order,
              set_number: 1,
              weight_kg: last?.weight_kg ?? 0,
              reps: last?.reps ?? 10,
              rir: last?.rir ?? 2,
              set_type: 'working' as SetType,
              completed: true,
            },
          ],
        }
        return [...prev, newExercise]
      })
      setEditing({ block: exercises.length, setIdx: 0 })
      setShowPicker(false)
    },
    [exercises.length]
  )

  const updateSet = useCallback(
    (block: number, setIdx: number, patch: Partial<ActiveSet>) => {
      setExercises(prev =>
        prev.map((e, bi) => {
          if (bi !== block) return e
          return {
            ...e,
            sets: e.sets.map((s, i) => (i === setIdx ? { ...s, ...patch } : s)),
          }
        })
      )
    },
    []
  )

  const handleAddSet = useCallback((block: number) => {
    setExercises(prev =>
      prev.map((e, bi) => {
        if (bi !== block) return e
        const last = e.sets[e.sets.length - 1]
        return {
          ...e,
          sets: [
            ...e.sets,
            {
              exercise_order: e.exercise_order,
              set_number: e.sets.length + 1,
              weight_kg: last?.weight_kg ?? 0,
              reps: last?.reps ?? 10,
              rir: last?.rir ?? 2,
              set_type: 'working' as SetType,
              completed: true,
            },
          ],
        }
      })
    )
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase
        .from('workouts')
        .update({ name: workoutName || null })
        .eq('id', workoutId)

      await supabase.from('workout_sets').delete().eq('workout_id', workoutId)

      const allSets = exercises.flatMap(eg =>
        eg.sets
          .filter(s => s.completed)
          .map(s => ({
            workout_id: workoutId,
            exercise_id: eg.exercise.id,
            exercise_order: eg.exercise_order,
            set_number: s.set_number,
            weight_kg: s.weight_kg,
            reps: s.reps,
            rir: s.rir,
            set_type: s.set_type,
          }))
      )

      if (allSets.length > 0) {
        const { error } = await supabase.from('workout_sets').insert(allSets)
        if (error) throw error
      }

      router.push(`/workout/${workoutId}`)
      router.refresh()
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    await supabase.from('workouts').delete().eq('id', workoutId)
    router.push('/history')
    router.refresh()
  }

  if (showPicker) {
    return (
      <ExercisePicker
        onSelect={handleSelectExercise}
        onClose={() => setShowPicker(false)}
      />
    )
  }

  const activeEx = editing ? exercises[editing.block] : null
  const activeSet = activeEx?.sets[editing!.setIdx]

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <div className="sticky top-0 z-[8] px-3.5 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.625rem)] bg-gradient-to-b from-bg via-bg/95 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="flex-1 min-w-0">
            <Eyebrow tone="accent">Düzenleme</Eyebrow>
            <input
              value={workoutName}
              onChange={e => setWorkoutName(e.target.value)}
              placeholder="Antrenman adı"
              className="w-full bg-transparent text-fg font-semibold text-[17px] tracking-[-0.01em] placeholder-fg-quaternary outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-3.5 pb-48 flex flex-col gap-2.5">
        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 shadow-[inset_0_0_0_0.5px_var(--color-border)] flex items-center justify-center">
              <FileEdit size={24} className="text-fg-tertiary" />
            </div>
            <p className="text-fg-tertiary text-sm">Henüz egzersiz yok</p>
          </div>
        ) : (
          exercises.map((eg, idx) => (
            <ExerciseCard
              key={`${eg.exercise.id}-${eg.exercise_order}`}
              exerciseGroup={eg}
              isCurrent={editing?.block === idx}
              activeSetIdx={editing?.block === idx ? editing.setIdx : -1}
              onSetClick={(setIdx) => setEditing({ block: idx, setIdx })}
              onAddSet={() => handleAddSet(idx)}
              onDeleteSet={(setIdx) => {
                setExercises(prev =>
                  prev.map((e, bi) => {
                    if (bi !== idx) return e
                    const filtered = e.sets
                      .filter((_, si) => si !== setIdx)
                      .map((s, si) => ({ ...s, set_number: si + 1 }))
                    return { ...e, sets: filtered }
                  })
                )
                if (editing?.block === idx && editing.setIdx === setIdx) {
                  setEditing({ block: idx, setIdx: 0 })
                }
              }}
              onRemove={() => {
                setExercises(prev =>
                  prev
                    .filter((_, i) => i !== idx)
                    .map((e, i) => ({ ...e, exercise_order: i + 1 }))
                )
                if (editing?.block === idx) setEditing(null)
              }}
            />
          ))
        )}
      </div>

      {/* Sticky composer for editing a set */}
      <div
        className="sticky bottom-0 z-10 bg-bg shadow-[0_-8px_24px_rgb(0_0_0_/_0.3)]"
        style={{ borderTop: '0.5px solid var(--color-border)' }}
      >
        {activeSet && editing && (
          <div className="px-3 pt-2.5 pb-2 flex flex-col gap-2">
            <div className="flex items-center gap-2 px-0.5">
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-fg-tertiary">
                Set {editing.setIdx + 1} · {activeEx?.exercise.name}
              </span>
            </div>
            <Stepper
              value={activeSet.weight_kg}
              step={2.5}
              quickStep={5}
              unit="kg"
              h={44}
              accent
              onChange={(v) => updateSet(editing.block, editing.setIdx, { weight_kg: v })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Stepper
                value={activeSet.reps}
                step={1}
                unit="rep"
                h={44}
                onChange={(v) => updateSet(editing.block, editing.setIdx, { reps: v })}
              />
              <RirRail
                value={activeSet.rir}
                onChange={(v) => updateSet(editing.block, editing.setIdx, { rir: v })}
                h={44}
              />
            </div>
          </div>
        )}

        <div className="px-3 pt-2 flex flex-col gap-2 border-t border-[var(--color-border)]/60 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              full
              onClick={() => setShowPicker(true)}
            >
              <Plus size={16} strokeWidth={2.5} />
              Egzersiz
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={handleSave}
              disabled={saving || deleting}
            >
              <Save size={15} strokeWidth={2.2} />
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          </div>
          <LongPressButton
            variant="danger"
            size="lg"
            duration={1500}
            disabled={saving || deleting}
            onComplete={handleDelete}
          >
            <Trash2 size={14} strokeWidth={2.2} />
            Antrenmanı Sil — Basılı Tut
          </LongPressButton>
        </div>
      </div>
    </div>
  )
}
