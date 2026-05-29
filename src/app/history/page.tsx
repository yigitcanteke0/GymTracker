import { createClient } from '@/lib/supabase/server'
import { HistoryExportButton } from './export-button'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Calendar } from 'lucide-react'
import { HistoryList, type HistoryGroup } from '@/components/workout/history-list'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const supabase = await createClient()

  const { data: rawWorkouts } = await supabase
    .from('workouts')
    .select('*')
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false })

  const workoutIds = rawWorkouts?.map(w => w.id) ?? []
  const { data: setRows } = workoutIds.length > 0
    ? await supabase
        .from('workout_sets')
        .select('workout_id, weight_kg, reps')
        .in('workout_id', workoutIds)
    : { data: null }

  const countMap = (setRows ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.workout_id] = (acc[s.workout_id] ?? 0) + 1
    return acc
  }, {})

  const volumeMap = (setRows ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.workout_id] = (acc[s.workout_id] ?? 0) + Number(s.weight_kg) * (s.reps ?? 0)
    return acc
  }, {})

  // 0 setli antrenmanları gizle
  const workouts = (rawWorkouts ?? []).filter(w => (countMap[w.id] ?? 0) > 0)

  // 30 günlük yoğunluk haritası
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayBuckets: number[] = Array(30).fill(0)
  for (const w of workouts) {
    const wd = new Date(w.started_at)
    wd.setHours(0, 0, 0, 0)
    const diff = Math.floor((today.getTime() - wd.getTime()) / 86400000)
    if (diff >= 0 && diff < 30) {
      const setCount = countMap[w.id] ?? 0
      const intensity = setCount >= 18 ? 3 : setCount >= 12 ? 2 : 1
      dayBuckets[29 - diff] = Math.max(dayBuckets[29 - diff], intensity)
    }
  }

  // Hafta gruplaması
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const lastWeekMonday = new Date(monday)
  lastWeekMonday.setDate(monday.getDate() - 7)

  const thisWeek: typeof workouts = []
  const lastWeek: typeof workouts = []
  const older: typeof workouts = []
  for (const w of workouts) {
    const wd = new Date(w.started_at)
    if (wd >= monday) thisWeek.push(w)
    else if (wd >= lastWeekMonday) lastWeek.push(w)
    else older.push(w)
  }

  const groups: HistoryGroup[] = [
    { label: 'Bu Hafta', items: thisWeek },
    { label: 'Geçen Hafta', items: lastWeek },
    { label: 'Daha Önce', items: older },
  ].filter(g => g.items.length > 0)

  return (
    <div className="min-h-screen bg-bg flex flex-col pb-32">
      <div className="sticky top-0 z-[8] px-3.5 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.625rem)] bg-gradient-to-b from-bg via-bg/95 to-transparent">
        <div className="flex items-center gap-2.5">
          <h1 className="flex-1 text-fg font-semibold text-[17px] tracking-[-0.01em]">
            Geçmiş
          </h1>
          <HistoryExportButton />
        </div>
      </div>

      <div className="flex-1 px-3.5 flex flex-col gap-3">
        <CalendarStrip days={dayBuckets} />

        {workouts.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-[18px] bg-surface-dim shadow-[inset_0_0_0_0.5px_var(--color-border)] flex flex-col items-center gap-3">
            <Calendar size={24} className="text-fg-quaternary" />
            <p className="text-fg-tertiary text-sm">Henüz antrenman yok.</p>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-fg-quaternary text-center px-2">
              İpucu — Bir antrenmanı kalıcı olarak silmek için sola kaydır
            </p>
            <HistoryList
              groups={groups}
              countMap={countMap}
              volumeMap={volumeMap}
            />
          </>
        )}
      </div>
    </div>
  )
}

function CalendarStrip({ days }: { days: number[] }) {
  return (
    <Card padding={14}>
      <div className="flex justify-between items-baseline mb-2.5">
        <Eyebrow>Son 30 Gün</Eyebrow>
        <div className="flex items-center gap-1.5 text-[11px] text-fg-tertiary">
          <span>az</span>
          <div className="flex gap-0.5">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  background:
                    i === 0
                      ? 'var(--color-surface-3)'
                      : `oklch(${0.4 + i * 0.08} 0.12 245)`,
                }}
                className="w-2 h-2 rounded-sm shadow-[inset_0_0_0_0.5px_var(--color-border)]"
              />
            ))}
          </div>
          <span>çok</span>
        </div>
      </div>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
      >
        {days.map((intensity, i) => (
          <div
            key={i}
            style={{
              background:
                intensity === 0
                  ? 'var(--color-surface-3)'
                  : `oklch(${0.4 + intensity * 0.08} 0.12 245)`,
            }}
            className="aspect-square rounded-[4px] shadow-[inset_0_0_0_0.5px_var(--color-border)]"
          />
        ))}
      </div>
    </Card>
  )
}
