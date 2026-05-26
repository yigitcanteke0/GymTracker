export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'other'
export type SetType = 'warmup' | 'working' | 'dropset'

export interface MuscleGroup {
  id: string
  user_id: string | null
  name: string
  icon: string
  color: string
  created_at: string
}

export interface Exercise {
  id: string
  user_id: string | null
  name: string
  muscle_group_id: string | null
  secondary_muscle_ids: string[]
  equipment: Equipment
  icon: string
  is_favorite: boolean
  instructions: string | null
  created_at: string
  muscle_group?: MuscleGroup
}

export interface Workout {
  id: string
  user_id: string
  name: string | null
  started_at: string
  finished_at: string | null
  notes: string | null
  created_at: string
}

export interface WorkoutSet {
  id: string
  workout_id: string
  exercise_id: string
  exercise_order: number
  set_number: number
  weight_kg: number
  reps: number | null
  rir: number | null
  set_type: SetType
  completed_at: string
  notes: string | null
  exercise?: Exercise
}

// UI-only: egzersiz + setleri birleştirilmiş
export interface WorkoutExerciseGroup {
  exercise: Exercise
  exercise_order: number
  sets: WorkoutSet[]
}

// Aktif antrenman state
export interface ActiveSet {
  id?: string
  exercise_order: number
  set_number: number
  weight_kg: number
  reps: number
  rir: number
  set_type: SetType
  completed: boolean
}

export interface ActiveExercise {
  exercise: Exercise
  exercise_order: number
  sets: ActiveSet[]
}
