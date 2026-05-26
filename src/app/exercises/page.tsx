import { createClient } from '@/lib/supabase/server'
import type { Exercise, MuscleGroup } from '@/types'
import { ExercisesClient } from './exercises-client'

export const dynamic = 'force-dynamic'

export default async function ExercisesPage() {
  const supabase = await createClient()

  const [{ data: exercises }, { data: muscleGroups }] = await Promise.all([
    supabase
      .from('exercises')
      .select('*, muscle_group:muscle_groups(*)')
      .order('is_favorite', { ascending: false })
      .order('name'),
    supabase.from('muscle_groups').select('*').order('name'),
  ])

  return (
    <ExercisesClient
      initialExercises={(exercises ?? []) as Exercise[]}
      muscleGroups={(muscleGroups ?? []) as MuscleGroup[]}
    />
  )
}
