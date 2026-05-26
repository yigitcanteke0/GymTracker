import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Dumbbell, Pencil, BarChart3 } from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'
import type { WorkoutExerciseGroup, WorkoutSet } from '@/types'
import { WorkoutExportButton } from './export-button'

export const dynamic = 'force-dynamic'

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
    <div className="min-h-screen bg-stone-950 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-md border-b border-stone-900">
        <div className="flex items-center gap-2 px-4 py-3">
          <Link
            href="/history"
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-stone-900 text-stone-400 border border-stone-800/80 hover:bg-stone-800 hover:text-stone-200 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-stone-50 font-semibold text-[15px] tracking-tight truncate">
              {workout.name ?? 'Antrenman'}
            </h1>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {formatDate(workout.started_at)}
            </p>
          </div>
          <Link
            href={`/workout/${id}/edit`}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-stone-900 text-stone-400 border border-stone-800/80 hover:bg-stone-800 hover:text-stone-200 transition-colors"
          >
            <Pencil size={14} strokeWidth={2.2} />
          </Link>
          <WorkoutExportButton workoutId={id} workoutName={workout.name} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 px-4 py-5">
        <StatCard
          icon={<Clock size={14} />}
          label="Süre"
          value={formatDuration(workout.started_at, workout.finished_at)}
        />
        <StatCard
          icon={<Dumbbell size={14} />}
          label="Egzersiz"
          value={String(groups.length)}
        />
        <StatCard
          icon={<BarChart3 size={14} />}
          label="Hacim"
          value={`${totalVolume.toLocaleString('tr-TR')}`}
          unit="kg"
        />
      </div>

      {/* Exercise groups */}
      <div className="px-4 space-y-3">
        {groups.map(group => (
          <div
            key={group.exercise_order}
            className="bg-stone-900/60 rounded-2xl border border-stone-800/80 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-800/70">
              <span className="text-xl shrink-0">{group.exercise.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-stone-50 font-medium text-[14px] truncate">
                  {group.exercise.name}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {group.sets.length} set · {group.exercise.equipment}
                </p>
              </div>
            </div>
            <div className="divide-y divide-stone-800/60">
              {group.sets.map(set => (
                <div key={set.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-5 text-center text-[12px] font-semibold text-stone-500 tnum shrink-0">
                    {set.set_type === 'warmup' ? 'W' : set.set_number}
                  </span>
                  <span className="flex-1 text-stone-100 tnum text-[14px]">
                    <span className="font-semibold">{set.weight_kg}</span>
                    <span className="text-stone-500 text-[11px] ml-0.5">kg</span>
                    <span className="text-stone-600 mx-1.5">×</span>
                    <span className="font-semibold">{set.reps}</span>
                  </span>
                  {set.rir !== null && (
                    <span className="text-[10px] font-medium bg-stone-800/80 text-stone-400 px-1.5 py-0.5 rounded">
                      RIR {set.rir}
                    </span>
                  )}
                  <span className="text-[11px] text-stone-600 tnum w-14 text-right">
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

function StatCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit?: string
}) {
  return (
    <div className="bg-stone-900/60 rounded-2xl border border-stone-800/80 p-3.5 text-center">
      <div className="flex items-center justify-center text-stone-500 mb-1.5">
        {icon}
      </div>
      <p className="text-stone-50 font-semibold text-[18px] tnum tracking-tight leading-none">
        {value}
        {unit && <span className="text-stone-500 text-[11px] ml-0.5 font-normal">{unit}</span>}
      </p>
      <p className="text-[10px] text-stone-500 mt-1.5 uppercase tracking-wider font-medium">
        {label}
      </p>
    </div>
  )
}
