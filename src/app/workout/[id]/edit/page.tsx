import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EditWorkoutClient } from './edit-client'
import type { WorkoutSet, ActiveExercise, Exercise, ActiveSet } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditWorkoutPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: workout, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !workout) notFound()

  const { data: sets } = await supabase
    .from('workout_sets')
    .select('*, exercise:exercises(*, muscle_group:muscle_groups(*))')
    .eq('workout_id', id)
    .order('exercise_order')
    .order('set_number')

  // Setleri ActiveExercise[] formuna dönüştür
  const groupMap = new Map<number, ActiveExercise>()
  for (const set of (sets ?? []) as WorkoutSet[]) {
    const order = set.exercise_order
    let group = groupMap.get(order)
    if (!group) {
      group = {
        exercise: set.exercise as Exercise,
        exercise_order: order,
        sets: [],
      }
      groupMap.set(order, group)
    }
    const activeSet: ActiveSet = {
      id: set.id,
      exercise_order: set.exercise_order,
      set_number: set.set_number,
      weight_kg: Number(set.weight_kg),
      reps: set.reps ?? 0,
      rir: set.rir ?? 2,
      set_type: set.set_type,
      completed: true,
    }
    group.sets.push(activeSet)
  }
  const exercises = Array.from(groupMap.values()).sort(
    (a, b) => a.exercise_order - b.exercise_order
  )

  return (
    <EditWorkoutClient
      workoutId={id}
      initialName={workout.name ?? ''}
      initialExercises={exercises}
    />
  )
}
