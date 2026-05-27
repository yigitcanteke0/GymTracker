import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Flame, ChevronRight, Dumbbell } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/ui/eyebrow'
import { BigNum } from '@/components/ui/big-num'
import { Glyph, GlyphTile } from '@/components/glyphs/glyph'
import { workoutMuscleGlyph } from '@/lib/glyph-map'
import { getOrAutoCloseActiveWorkout } from '@/lib/active-workout'
import { ActiveWorkoutBanner } from '@/components/workout/active-workout-banner'
import { PrefetchLink } from '@/components/ui/prefetch-link'

export const dynamic = 'force-dynamic'

const DAY_LABELS = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P']

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <UnauthedSplash />
  }

  // Tüm sorguları paralel başlat — geçiş süresini ~5x → ~2x'e indirir
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const [activeWorkout, recentResult, weekSetsResult] = await Promise.all([
    getOrAutoCloseActiveWorkout(supabase, user.id),
    supabase
      .from('workouts')
      .select('*')
      .not('finished_at', 'is', null)
      .order('started_at', { ascending: false })
      .limit(15),
    supabase
      .from('workout_sets')
      .select('weight_kg, reps, workout:workouts!inner(started_at, user_id)')
      .gte('workout.started_at', sevenDaysAgo),
  ])

  const recentRaw = recentResult.data
  const weekSets = weekSetsResult.data

  // Aktif set sayısı + recent set sayıları → tek istek olarak paralel batch
  const recentIds = recentRaw?.map(w => w.id) ?? []
  const idsToCount = activeWorkout
    ? [activeWorkout.id, ...recentIds]
    : recentIds

  const { data: setRows } = idsToCount.length > 0
    ? await supabase
        .from('workout_sets')
        .select('workout_id')
        .in('workout_id', idsToCount)
    : { data: null }

  const countMap = (setRows ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.workout_id] = (acc[s.workout_id] ?? 0) + 1
    return acc
  }, {})

  const activeSetCount = activeWorkout ? countMap[activeWorkout.id] ?? 0 : 0
  const recentWorkouts = (recentRaw ?? [])
    .filter(w => (countMap[w.id] ?? 0) > 0)
    .slice(0, 5)

  const weekVolume = (weekSets ?? []).reduce(
    (acc, s) => acc + Number(s.weight_kg) * (s.reps ?? 0),
    0
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monday = new Date(today)
  const dayOfWeek = (today.getDay() + 6) % 7
  monday.setDate(today.getDate() - dayOfWeek)

  const weekDayActive = [false, false, false, false, false, false, false]
  const weekWorkoutDates = new Set<string>()
  for (const s of weekSets ?? []) {
    const wo = s.workout as { started_at?: string } | null
    if (!wo?.started_at) continue
    const d = new Date(wo.started_at)
    d.setHours(0, 0, 0, 0)
    const diff = Math.floor((d.getTime() - monday.getTime()) / 86400000)
    if (diff >= 0 && diff < 7) {
      weekDayActive[diff] = true
      weekWorkoutDates.add(d.toISOString().slice(0, 10))
    }
  }
  const weekWorkoutCount = weekWorkoutDates.size

  const now = new Date()
  const dayName = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(now)
  const dayNumber = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
  }).format(now)
  const greeting = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} · ${dayNumber}`

  return (
    <div className="px-4 pt-3 pb-32 flex flex-col gap-4">
      {/* Header greeting */}
      <div className="px-1 pt-2 pb-1">
        <Eyebrow tone="accent">{greeting}</Eyebrow>
        <h1 className="text-[26px] font-semibold text-fg tracking-[-0.02em] mt-1">
          Selam.
        </h1>
        <p className="text-[14.5px] text-fg-tertiary mt-0.5 tracking-[-0.005em]">
          Bugün hangi kası çalıştıracaksın?
        </p>
      </div>

      {/* Hero: Bu Hafta */}
      <Card
        padding={0}
        className="relative overflow-hidden bg-[linear-gradient(135deg,var(--color-accent-950)_0%,var(--color-surface)_60%)]"
      >
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgb(31 90 151 / 0.15), transparent 50%)',
          }}
        />
        <div
          className="absolute -right-3.5 -bottom-3.5 text-accent-900 opacity-60 pointer-events-none"
          style={{ transform: 'rotate(-12deg)' }}
        >
          <Glyph name="chest" size={110} />
        </div>

        <div className="relative p-[18px] flex flex-col gap-3.5">
          <div className="flex items-center justify-between gap-2">
            <Eyebrow>Bu Hafta</Eyebrow>
            <div className="inline-flex items-center gap-1 bg-surface-3 rounded-full px-2.5 py-1 text-[11.5px] font-semibold text-amber-400 shadow-[inset_0_0_0_0.5px_rgb(245_158_11_/_0.2)] whitespace-nowrap">
              <Flame size={13} strokeWidth={2} fill="currentColor" />
              <span className="text-fg-secondary">{weekWorkoutCount} antrenman</span>
            </div>
          </div>

          <div className="flex gap-6 items-baseline">
            <BigNum value={weekWorkoutCount} unit="antrenman" size={42} />
            <div className="w-px h-9 bg-border self-center" />
            <BigNum
              value={weekVolume > 0 ? (weekVolume / 1000).toFixed(1) : '0'}
              unit="ton"
              size={42}
            />
          </div>

          <div className="flex gap-1.5 mt-0.5">
            {DAY_LABELS.map((d, i) => {
              const done = weekDayActive[i]
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className={`h-1.5 w-full rounded-full ${
                      done
                        ? 'bg-accent-600 shadow-[0_0_0_0.5px_var(--color-accent-border)]'
                        : 'bg-surface-3 shadow-[inset_0_0_0_0.5px_var(--color-border)]'
                    }`}
                  />
                  <div className="text-[10px] text-fg-tertiary font-semibold">{d}</div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Aktif antrenman banner VEYA primary CTA */}
      {activeWorkout ? (
        <ActiveWorkoutBanner
          workoutId={activeWorkout.id}
          workoutName={activeWorkout.name}
          startedAt={activeWorkout.started_at}
          setCount={activeSetCount}
        />
      ) : (
        <Link
          href="/workout/active"
          prefetch
          className="relative overflow-hidden h-[76px] rounded-[18px] flex items-center gap-3.5 px-[18px] bg-[linear-gradient(180deg,var(--color-accent-500),var(--color-accent-700))] text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.18),0_8px_24px_-8px_var(--color-accent-950),0_1px_2px_rgb(0_0_0_/_0.4)] transition-transform active:scale-[0.99]"
        >
          <div className="w-[50px] h-[50px] rounded-[14px] bg-black/20 flex items-center justify-center shadow-[inset_0_0_0_0.5px_rgb(255_255_255_/_0.15)]">
            <Plus size={26} strokeWidth={2.5} />
          </div>
          <div className="flex-1 text-left">
            <Eyebrow className="!text-white/70">Yeni</Eyebrow>
            <div className="text-[19px] font-semibold tracking-[-0.015em] mt-0.5">
              Antrenman Başlat
            </div>
          </div>
          <ChevronRight className="opacity-70" />
        </Link>
      )}

      {/* Son antrenmanlar */}
      <div className="px-1 pt-1 flex items-center justify-between">
        <Eyebrow>Son Antrenmanlar</Eyebrow>
        <Link
          href="/history"
          className="text-fg-tertiary text-[12px] font-semibold inline-flex items-center gap-0.5"
        >
          Tümü <ChevronRight size={12} />
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {recentWorkouts.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl bg-surface-dim shadow-[inset_0_0_0_0.5px_var(--color-border)]">
            <p className="text-fg-tertiary text-sm">
              Henüz antrenman yok. İlkini başlatmaya ne dersin?
            </p>
          </div>
        ) : (
          recentWorkouts.map(w => {
            const muscle = workoutMuscleGlyph(w.name)
            const setCount = countMap[w.id] ?? 0
            return (
              <PrefetchLink
                key={w.id}
                href={`/workout/${w.id}`}
                className="block"
              >
                <Card
                  padding={12}
                  className="flex items-center gap-3 transition-transform active:scale-[0.99]"
                >
                  <GlyphTile name={muscle} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-fg tracking-[-0.01em] truncate">
                      {w.name ?? 'Antrenman'}
                    </div>
                    <div className="text-[12px] text-fg-tertiary mt-0.5 flex items-center gap-1.5 tnum">
                      <span>{formatDate(w.started_at)}</span>
                      <span className="opacity-40">·</span>
                      <span>{setCount} set</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-fg-quaternary shrink-0" />
                </Card>
              </PrefetchLink>
            )
          })
        )}
      </div>
    </div>
  )
}

function UnauthedSplash() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 gap-10">
      <div className="text-center space-y-3">
        <div className="h-16 w-16 rounded-2xl bg-accent-600 mx-auto flex items-center justify-center shadow-[0_8px_24px_-8px_var(--color-accent-950)]">
          <Dumbbell size={28} className="text-white" strokeWidth={2.2} />
        </div>
        <h1 className="text-3xl font-semibold text-fg tracking-tight">Workout Tracker</h1>
        <p className="text-fg-tertiary text-[15px]">
          Antrenmanlarını sade ve hızlı tut.
        </p>
      </div>
      <div className="flex flex-col gap-2.5 w-full max-w-sm">
        <Link
          href="/login"
          className="flex items-center justify-center h-13 rounded-[14px] bg-accent-600 hover:opacity-95 text-white font-semibold text-[15px] transition-all active:scale-[0.98] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.12),0_6px_16px_-4px_var(--color-accent-950)]"
        >
          Giriş Yap
        </Link>
        <Link
          href="/signup"
          className="flex items-center justify-center h-13 rounded-[14px] bg-surface-2 text-fg font-semibold text-[15px] transition-all active:scale-[0.98] shadow-[inset_0_0_0_0.5px_var(--color-border)]"
        >
          Hesap Oluştur
        </Link>
      </div>
    </div>
  )
}
