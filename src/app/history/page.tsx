import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'
import { HistoryExportButton } from './export-button'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const supabase = await createClient()

  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false })

  // Set sayılarını çek
  const workoutIds = workouts?.map(w => w.id) ?? []
  const { data: setCounts } = await supabase
    .from('workout_sets')
    .select('workout_id')
    .in('workout_id', workoutIds)

  const countMap = (setCounts ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.workout_id] = (acc[s.workout_id] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-zinc-950 pb-8">
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="flex-1 text-white font-semibold text-base">Antrenman Geçmişi</h1>
          <HistoryExportButton />
        </div>
      </div>

      <div className="px-4 py-4 space-y-2">
        {!workouts?.length ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <span className="text-5xl">📋</span>
            <p className="text-zinc-500">Henüz tamamlanmış antrenman yok</p>
          </div>
        ) : (
          workouts.map(workout => (
            <Link
              key={workout.id}
              href={`/workout/${workout.id}`}
              className="flex items-center gap-3 bg-zinc-900 rounded-2xl border border-zinc-800 px-4 py-3.5 hover:border-zinc-600 transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold">
                  {workout.name ?? 'Antrenman'}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {formatDate(workout.started_at)}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-zinc-400">
                    ⏱ {formatDuration(workout.started_at, workout.finished_at)}
                  </span>
                  <span className="text-xs text-zinc-400">
                    🏋️ {countMap[workout.id] ?? 0} set
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-zinc-600 shrink-0" />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
