'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ActiveExercise, Exercise, SetType } from '@/types'
import type { PreviousSet } from '@/lib/last-performance'
import { ExerciseCard } from '@/components/workout/exercise-card'
import { ExercisePicker } from '@/components/workout/exercise-picker'
import { WorkoutTimer } from '@/components/workout/workout-timer'
import { Button } from '@/components/ui/button'
import { LongPressButton } from '@/components/ui/long-press-button'

export default function ActiveWorkoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const startedAt = useRef(new Date().toISOString())

  const [workoutName, setWorkoutName] = useState('')
  const [exercises, setExercises] = useState<ActiveExercise[]>([])
  const [previousSetsMap, setPreviousSetsMap] = useState<Record<string, PreviousSet[]>>({})
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSelectExercise = useCallback(
    (exercise: Exercise, previousSets?: PreviousSet[]) => {
      // Önceki setleri sakla (varsa)
      if (previousSets && previousSets.length > 0) {
        setPreviousSetsMap(prev => ({ ...prev, [exercise.id]: previousSets }))
      }

      // Yeni setin başlangıç değerleri için önceki seti referans al
      const firstPrev = previousSets?.[0]

      setExercises(prev => {
        const order = prev.length + 1
        const newExercise: ActiveExercise = {
          exercise,
          exercise_order: order,
          sets: [
            {
              exercise_order: order,
              set_number: 1,
              weight_kg: firstPrev?.weight_kg ?? 0,
              reps: firstPrev?.reps ?? 10,
              rir: firstPrev?.rir ?? 2,
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
    <div className="flex flex-col min-h-screen bg-stone-950">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-md border-b border-stone-900">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.push('/')}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-stone-900 text-stone-400 border border-stone-800/80 hover:bg-stone-800 hover:text-stone-200 transition-colors"
          >
            <X size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-accent-500 uppercase tracking-[0.1em]">
              Aktif Antrenman
            </p>
            <input
              value={workoutName}
              onChange={e => setWorkoutName(e.target.value)}
              placeholder="Antrenman adı"
              className="w-full bg-transparent text-stone-50 font-semibold text-[15px] placeholder-stone-600 outline-none"
            />
          </div>
          <WorkoutTimer startedAt={startedAt.current} />
        </div>
        {totalSets > 0 && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-1 bg-stone-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(completedSets / totalSets) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-stone-500 tnum font-medium">
                {completedSets}/{totalSets} set
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
            <div className="h-20 w-20 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center">
              <span className="text-4xl">🏋️</span>
            </div>
            <div className="space-y-1">
              <p className="text-stone-100 font-semibold text-lg tracking-tight">
                Antrenman başladı
              </p>
              <p className="text-stone-500 text-sm">İlk egzersizini ekle</p>
            </div>
          </div>
        ) : (
          exercises.map((eg, idx) => (
            <ExerciseCard
              key={`${eg.exercise.id}-${eg.exercise_order}`}
              exerciseGroup={eg}
              previousSets={previousSetsMap[eg.exercise.id]}
              onChange={updated => handleExerciseChange(idx, updated)}
              onRemove={() => handleRemoveExercise(idx)}
            />
          ))
        )}
      </div>

      {/* Sticky footer */}
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

        {exercises.length > 0 && (
          <LongPressButton
            onComplete={handleFinish}
            duration={1200}
            disabled={saving}
            holdingLabel="Bitiriliyor"
            className="w-full h-[52px] rounded-xl border border-emerald-800/60 bg-emerald-950/30 text-emerald-300 font-medium text-[15px]"
          >
            <CheckCircle2 size={18} strokeWidth={2.2} />
            {saving ? 'Kaydediliyor…' : 'Antrenmanı Bitir — Basılı Tut'}
          </LongPressButton>
        )}
      </div>
    </div>
  )
}
