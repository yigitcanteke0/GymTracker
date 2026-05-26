import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Play, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'
import { formatDate, formatDuration } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: recentWorkouts } = user
    ? await supabase
        .from('workouts')
        .select('*')
        .not('finished_at', 'is', null)
        .order('started_at', { ascending: false })
        .limit(5)
    : { data: null }

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const { data: weekSets } = user
    ? await supabase
        .from('workout_sets')
        .select('weight_kg, reps, workout:workouts!inner(started_at, user_id)')
        .gte('workout.started_at', sevenDaysAgo)
    : { data: null }

  const weekVolume = (weekSets ?? []).reduce(
    (acc, s) => acc + s.weight_kg * (s.reps ?? 0),
    0
  )

  const weekWorkoutIds = new Set(
    (weekSets ?? []).map((s) => {
      const wo = s.workout as { started_at?: string } | null
      return wo?.started_at
    }).filter(Boolean)
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 gap-6">
        <div className="text-center">
          <span className="text-6xl">🏋️</span>
          <h1 className="text-3xl font-bold text-white mt-4">Workout Tracker</h1>
          <p className="text-zinc-400 mt-2">Antrenmanlarını kayıt altına al</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <Link
            href="/login"
            className="flex items-center justify-center h-14 rounded-2xl bg-indigo-600 text-white font-semibold text-lg"
          >
            Giriş Yap
          </Link>
          <Link
            href="/signup"
            className="flex items-center justify-center h-14 rounded-2xl bg-zinc-800 text-zinc-200 font-semibold text-lg"
          >
            Kayıt Ol
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-28">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <p className="text-zinc-400 text-sm">Merhaba 👋</p>
        <h1 className="text-white text-2xl font-bold mt-0.5">Bugün ne çalışıyoruz?</h1>
      </div>

      {/* Haftalık özet */}
      <div className="px-4 mb-4">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-3">
            <TrendingUp size={16} />
            <span className="text-sm font-medium">Bu Hafta</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-2xl font-bold text-white">{weekWorkoutIds.size}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Antrenman</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {weekVolume > 0 ? `${(weekVolume / 1000).toFixed(1)}t` : '0'}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">Toplam Hacim</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hızlı başlat */}
      <div className="px-4 mb-6">
        <Link
          href="/workout/active"
          className="flex items-center justify-center gap-3 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-xl hover:bg-indigo-500 active:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          <Play size={24} fill="white" />
          Antrenman Başlat
        </Link>
      </div>

      {/* Son antrenmanlar */}
      {recentWorkouts && recentWorkouts.length > 0 && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Son Antrenmanlar</h2>
            <Link href="/history" className="text-indigo-400 text-sm">
              Tümü
            </Link>
          </div>
          <div className="space-y-2">
            {recentWorkouts.map(workout => (
              <Link
                key={workout.id}
                href={`/workout/${workout.id}`}
                className="flex items-center gap-3 bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-3 hover:border-zinc-600 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{workout.name ?? 'Antrenman'}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {formatDate(workout.started_at)} · {formatDuration(workout.started_at, workout.finished_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
