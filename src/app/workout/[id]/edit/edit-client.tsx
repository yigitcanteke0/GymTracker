'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Save, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ActiveExercise, Exercise, SetType } from '@/types'
import { ExerciseCard } from '@/components/workout/exercise-card'
import { ExercisePicker } from '@/components/workout/exercise-picker'
import { Button } from '@/components/ui/button'
import { LongPressButton } from '@/components/ui/long-press-button'

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
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSelectExercise = useCallback((exercise: Exercise) => {
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
    setShowPicker(false)
  }, [])

  const handleExerciseChange = useCallback(
    (idx: number, updated: ActiveExercise) => {
      setExercises(prev => prev.map((e, i) => (i === idx ? updated : e)))
    },
    []
  )

  const handleRemoveExercise = useCallback((idx: number) => {
    setExercises(prev =>
      prev
        .filter((_, i) => i !== idx)
        .map((e, i) => ({ ...e, exercise_order: i + 1 }))
    )
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // İsim güncelle
      await supabase
        .from('workouts')
        .update({ name: workoutName || null })
        .eq('id', workoutId)

      // Mevcut tüm setleri sil
      await supabase.from('workout_sets').delete().eq('workout_id', workoutId)

      // Yeni setleri ekle
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

  return (
    <div className="flex flex-col min-h-screen bg-stone-950">
      <div className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-md border-b border-stone-900">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-stone-900 text-stone-400 border border-stone-800/80 hover:bg-stone-800 hover:text-stone-200 transition-colors"
          >
            <X size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-[0.1em]">
              Düzenleme
            </p>
            <input
              value={workoutName}
              onChange={e => setWorkoutName(e.target.value)}
              placeholder="Antrenman adı"
              className="w-full bg-transparent text-stone-50 font-semibold text-[15px] placeholder-stone-600 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3 pb-32">
        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center">
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-stone-500 text-sm">Henüz egzersiz yok</p>
          </div>
        ) : (
          exercises.map((eg, idx) => (
            <ExerciseCard
              key={`${eg.exercise.id}-${eg.exercise_order}`}
              exerciseGroup={eg}
              onChange={updated => handleExerciseChange(idx, updated)}
              onRemove={() => handleRemoveExercise(idx)}
            />
          ))
        )}
      </div>

      <div className="sticky bottom-0 bg-stone-950/90 backdrop-blur-md border-t border-stone-900 px-4 py-3.5 space-y-2.5">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => setShowPicker(true)}
        >
          <Plus size={18} strokeWidth={2.5} />
          Egzersiz Ekle
        </Button>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSave}
          disabled={saving || deleting}
        >
          <Save size={18} strokeWidth={2.2} />
          {saving ? 'Kaydediliyor…' : 'Değişiklikleri Kaydet'}
        </Button>

        <LongPressButton
          onComplete={handleDelete}
          duration={1500}
          disabled={saving || deleting}
          holdingLabel="Siliniyor"
          fillClassName="bg-red-500/30"
          className="w-full h-11 rounded-xl bg-stone-900 border border-stone-800/80 text-red-400 font-medium text-[13px] hover:bg-red-950/30 hover:border-red-900/60 transition-colors"
        >
          <Trash2 size={13} strokeWidth={2.2} />
          Antrenmanı Sil — Basılı Tut
        </LongPressButton>
      </div>
    </div>
  )
}
