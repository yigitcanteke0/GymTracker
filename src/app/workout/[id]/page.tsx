import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Dumbbell, Pencil } from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'

export const dynamic = 'force-dynamic'
import type { WorkoutExerciseGroup, WorkoutSet } from '@/types'
import { WorkoutExportButton } from './export-button'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WorkoutDetailPage({ params }: PageProps) {
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

  // Setleri egzersiz gruplarına topla
  const groups: WorkoutExerciseGroup[] = []
  for (const set of sets ?? []) {
    const existing = groups.find(g => g.exercise_order === set.exercise_order)
    if (existing) {
      existing.sets.push(set as WorkoutSet)
    } else {
      groups.push({
        exercise: (set as WorkoutSet).exercise!,
        exercise_order: set.exercise_order,
        sets: [set as WorkoutSet],
      })
    }
  }

  const totalVolume = (sets ?? []).reduce(
    (acc, s) => acc + s.weight_kg * (s.reps ?? 0),
    0
  )

  return (
    <div className="min-h-screen bg-zinc-950 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/history"
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-white font-semibold text-base">
              {workout.name ?? 'Antrenman'}
            </h1>
            <p className="text-xs text-zinc-500">{formatDate(workout.started_at)}</p>
          </div>
          <Link
            href={`/workout/${id}/edit`}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all"
          >
            <Pencil size={15} />
          </Link>
          <WorkoutExportButton workoutId={id} workoutName={workout.name} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 py-4">
        {[
          {
            icon: <Clock size={16} />,
            label: 'Süre',
            value: formatDuration(workout.started_at, workout.finished_at),
          },
          {
            icon: <Dumbbell size={16} />,
            label: 'Egzersiz',
            value: groups.length,
          },
          {
            icon: <span className="text-base">🏋️</span>,
            label: 'Toplam Hacim',
            value: `${totalVolume.toLocaleString('tr-TR')} kg`,
          },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-900 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-zinc-400 mb-1">
              {stat.icon}
            </div>
            <p className="text-white font-bold text-lg">{stat.value}</p>
            <p className="text-xs text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Exercise groups */}
      <div className="px-4 space-y-3">
        {groups.map(group => (
          <div key={group.exercise_order} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
              <span className="text-2xl">{group.exercise.icon}</span>
              <div>
                <p className="text-white font-semibold">{group.exercise.name}</p>
                <p className="text-xs text-zinc-500">
                  {group.sets.length} set · {group.exercise.equipment}
                </p>
              </div>
            </div>
            <div className="divide-y divide-zinc-800">
              {group.sets.map(set => (
                <div key={set.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-6 text-center text-sm font-bold text-zinc-500">
                    {set.set_type === 'warmup' ? 'ISI' : set.set_number}
                  </span>
                  <span className="flex-1 text-white tabular-nums">
                    {set.weight_kg} kg × {set.reps} tekrar
                  </span>
                  {set.rir !== null && (
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                      RIR {set.rir}
                    </span>
                  )}
                  <span className="text-xs text-zinc-600 tabular-nums">
                    {set.weight_kg * (set.reps ?? 0)} kg
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
