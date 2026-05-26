'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ActiveExercise, Exercise, SetType } from '@/types'
import { ExerciseCard } from '@/components/workout/exercise-card'
import { ExercisePicker } from '@/components/workout/exercise-picker'
import { WorkoutTimer } from '@/components/workout/workout-timer'
import { Button } from '@/components/ui/button'

export default function ActiveWorkoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const startedAt = useRef(new Date().toISOString())

  const [workoutName, setWorkoutName] = useState('')
  const [exercises, setExercises] = useState<ActiveExercise[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)

  const handleSelectExercise = useCallback(
    (exercise: Exercise) => {
      setExercises(prev => {
        const order = prev.length + 1
        const newExercise: ActiveExercise = {
          exercise,
          exercise_order: order,
          sets: [
            {
              exercise_order: order,
              set_number: 1,
              weight_kg: 0,
              reps: 10,
              rir: 2,
              set_type: 'working' as SetType,
              completed: false,
            },
          ],
        }
        return [...prev, newExercise]
      })
      setShowPicker(false)
    },
    []
  )

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

  const handleFinish = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Workout oluştur
      const { data: workout, error: wError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: workoutName || null,
          started_at: startedAt.current,
          finished_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (wError || !workout) throw wError

      // Tüm setleri toplu ekle
      const allSets = exercises.flatMap(eg =>
        eg.sets
          .filter(s => s.completed)
          .map(s => ({
            workout_id: workout.id,
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
        const { error: sError } = await supabase.from('workout_sets').insert(allSets)
        if (sError) throw sError
      }

      router.push(`/workout/${workout.id}`)
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  const totalSets = exercises.reduce((acc, e) => acc + e.sets.length, 0)
  const completedSets = exercises.reduce(
    (acc, e) => acc + e.sets.filter(s => s.completed).length,
    0
  )

  if (showPicker) {
    return (
      <ExercisePicker
        onSelect={handleSelectExercise}
        onClose={() => setShowPicker(false)}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.push('/')}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300"
          >
            <X size={18} />
          </button>
          <div className="flex-1">
            <input
              value={workoutName}
              onChange={e => setWorkoutName(e.target.value)}
              placeholder="Antrenman adı (opsiyonel)"
              className="w-full bg-transparent text-white font-semibold text-base placeholder-zinc-600 outline-none"
            />
          </div>
          <WorkoutTimer startedAt={startedAt.current} />
        </div>
        {totalSets > 0 && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(completedSets / totalSets) * 100}%` }}
                />
              </div>
              <span className="text-xs text-zinc-500 tabular-nums">
                {completedSets}/{totalSets}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <span className="text-6xl">🏋️</span>
            <div>
              <p className="text-white font-semibold text-lg">Antrenman başladı!</p>
              <p className="text-zinc-500 text-sm mt-1">İlk egzersizini ekle</p>
            </div>
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

      {/* Sticky footer */}
      <div className="sticky bottom-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 px-4 py-4 space-y-2.5">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => setShowPicker(true)}
        >
          <Plus size={20} />
          Egzersiz Ekle
        </Button>

        {exercises.length > 0 && (
          <>
            {showFinishConfirm ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="lg"
                  className="flex-1"
                  onClick={() => setShowFinishConfirm(false)}
                >
                  İptal
                </Button>
                <Button
                  variant="success"
                  size="lg"
                  className="flex-1"
                  onClick={handleFinish}
                  disabled={saving}
                >
                  <CheckCircle2 size={20} />
                  {saving ? 'Kaydediliyor…' : 'Evet, Bitir'}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="lg"
                className="w-full border-emerald-800 text-emerald-400 hover:bg-emerald-950/30"
                onClick={() => setShowFinishConfirm(true)}
              >
                <CheckCircle2 size={20} />
                Antrenmanı Bitir
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
