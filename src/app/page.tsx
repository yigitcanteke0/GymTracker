import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Play, TrendingUp, ChevronRight, Calendar, Dumbbell } from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'

export const dynamic = 'force-dynamic'

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
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6 gap-10">
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-accent-600 mx-auto flex items-center justify-center shadow-lg shadow-accent-950/40">
            <Dumbbell size={28} className="text-white" strokeWidth={2.2} />
          </div>
          <h1 className="text-3xl font-semibold text-stone-50 tracking-tight">
            Workout Tracker
          </h1>
          <p className="text-stone-400 text-[15px]">
            Antrenmanlarını sade ve hızlı tut.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 w-full max-w-sm">
          <Link
            href="/login"
            className="flex items-center justify-center h-13 rounded-xl bg-accent-600 hover:bg-accent-500 text-white font-medium text-[15px] transition-colors active:scale-[0.98]"
          >
            Giriş Yap
          </Link>
          <Link
            href="/signup"
            className="flex items-center justify-center h-13 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-100 font-medium text-[15px] transition-colors active:scale-[0.98]"
          >
            Hesap Oluştur
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 pb-32">
      {/* Header */}
      <div className="px-5 pt-14 pb-7">
        <p className="text-stone-500 text-[13px] font-medium">Merhaba 👋</p>
        <h1 className="text-stone-50 text-[26px] font-semibold mt-1 tracking-tight leading-tight">
          Bugün ne çalışıyoruz?
        </h1>
      </div>

      {/* Haftalık özet */}
      <div className="px-5 mb-4">
        <div className="bg-stone-900/60 rounded-2xl border border-stone-800/80 p-5">
          <div className="flex items-center gap-2 text-stone-400 mb-4">
            <TrendingUp size={14} strokeWidth={2.2} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em]">
              Bu Hafta
            </span>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-[28px] font-semibold text-stone-50 tnum tracking-tight leading-none">
                {weekWorkoutIds.size}
              </p>
              <p className="text-[12px] text-stone-500 mt-1.5">Antrenman</p>
            </div>
            <div>
              <p className="text-[28px] font-semibold text-stone-50 tnum tracking-tight leading-none">
                {weekVolume > 0 ? `${(weekVolume / 1000).toFixed(1)}` : '0'}
                <span className="text-stone-500 text-base font-normal ml-1">ton</span>
              </p>
              <p className="text-[12px] text-stone-500 mt-1.5">Toplam Hacim</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hızlı başlat */}
      <div className="px-5 mb-8">
        <Link
          href="/workout/active"
          prefetch
          className="group flex items-center justify-center gap-3 h-16 rounded-2xl bg-accent-600 hover:bg-accent-500 active:bg-accent-700 text-white font-semibold text-lg transition-all active:scale-[0.99] shadow-lg shadow-accent-950/30"
        >
          <Play size={22} strokeWidth={2.5} fill="white" />
          Antrenman Başlat
        </Link>
      </div>

      {/* Son antrenmanlar */}
      {recentWorkouts && recentWorkouts.length > 0 ? (
        <div className="px-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-stone-200 font-semibold text-[15px] tracking-tight">
              Son Antrenmanlar
            </h2>
            <Link
              href="/history"
              className="text-accent-400 hover:text-accent-300 text-[13px] font-medium transition-colors"
            >
              Tümü →
            </Link>
          </div>
          <div className="space-y-2">
            {recentWorkouts.map(workout => (
              <Link
                key={workout.id}
                href={`/workout/${workout.id}`}
                className="group flex items-center gap-3 bg-stone-900/60 rounded-xl border border-stone-800/80 px-4 py-3.5 hover:border-stone-700 hover:bg-stone-900 transition-all active:scale-[0.99]"
              >
                <div className="h-9 w-9 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                  <Calendar size={15} className="text-stone-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-stone-100 font-medium text-[14px] truncate">
                    {workout.name ?? 'Antrenman'}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {formatDate(workout.started_at)} ·{' '}
                    <span className="tnum">
                      {formatDuration(workout.started_at, workout.finished_at)}
                    </span>
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-stone-600 group-hover:text-stone-400 transition-colors shrink-0"
                />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5">
          <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-stone-800">
            <p className="text-stone-500 text-sm">
              Henüz antrenman yok. İlkini başlatmaya ne dersin?
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
