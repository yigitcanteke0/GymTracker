import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Calendar, Clock, Hash } from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'
import { HistoryExportButton } from './export-button'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const supabase = await createClient()

  const { data: rawWorkouts } = await supabase
    .from('workouts')
    .select('*')
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false })

  const workoutIds = rawWorkouts?.map(w => w.id) ?? []
  const { data: setCounts } = await supabase
    .from('workout_sets')
    .select('workout_id')
    .in('workout_id', workoutIds)

  const countMap = (setCounts ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.workout_id] = (acc[s.workout_id] ?? 0) + 1
    return acc
  }, {})

  // 0 setli antrenmanları gizle
  const workouts = (rawWorkouts ?? []).filter(w => (countMap[w.id] ?? 0) > 0)

  return (
    <div className="min-h-screen bg-stone-950 pb-32">
      <div className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-md border-b border-stone-900">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-stone-900 text-stone-400 border border-stone-800/80 hover:bg-stone-800 hover:text-stone-200 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="flex-1 text-stone-50 font-semibold text-[15px] tracking-tight">
            Antrenman Geçmişi
          </h1>
          <HistoryExportButton />
        </div>
      </div>

      <div className="px-4 py-5 space-y-2">
        {!workouts?.length ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center">
              <Calendar size={24} className="text-stone-600" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <p className="text-stone-200 font-medium">Henüz antrenman yok</p>
              <p className="text-stone-500 text-sm">İlk antrenmanını başlat</p>
            </div>
          </div>
        ) : (
          workouts.map(workout => (
            <Link
              key={workout.id}
              href={`/workout/${workout.id}`}
              className="group flex items-center gap-3 bg-stone-900/60 rounded-2xl border border-stone-800/80 px-4 py-3.5 hover:border-stone-700 hover:bg-stone-900 transition-all active:scale-[0.99]"
            >
              <div className="h-10 w-10 rounded-xl bg-stone-800 flex items-center justify-center shrink-0">
                <Calendar size={16} className="text-stone-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-stone-100 font-medium text-[14px] truncate">
                  {workout.name ?? 'Antrenman'}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {formatDate(workout.started_at)}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-[11px] text-stone-400 tnum">
                    <Clock size={11} />
                    {formatDuration(workout.started_at, workout.finished_at)}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-stone-400 tnum">
                    <Hash size={11} />
                    {countMap[workout.id] ?? 0} set
                  </span>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-stone-600 group-hover:text-stone-400 transition-colors shrink-0"
              />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
