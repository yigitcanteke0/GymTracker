import type { SupabaseClient } from '@supabase/supabase-js'

/** Otomatik kapanma süresi: 2 saat */
export const ACTIVE_WORKOUT_MAX_MS = 2 * 60 * 60 * 1000

export interface ActiveWorkoutRow {
  id: string
  user_id: string
  name: string | null
  started_at: string
  finished_at: string | null
}

/**
 * Kullanıcının halihazırda açık olan antrenmanını döner.
 *
 * Temizlik kuralları (dashboard her açıldığında uygulanır):
 *  1. Hiç set girilmemiş açık antrenmanlar **silinir** (yaşı önemsiz) —
 *     kullanıcı yeni antrenman başlatıp egzersiz/set girmeden çıkmışsa
 *     arka planda kalmaması için.
 *  2. 2 saatten eski açık antrenmanlar `started_at + 2 saat` ile kapatılır.
 *
 * Tek bir aktif antrenman varsayımı: en yeni `finished_at IS NULL` olanı döner.
 */
export async function getOrAutoCloseActiveWorkout(
  supabase: SupabaseClient,
  userId: string
): Promise<ActiveWorkoutRow | null> {
  const { data: rows } = await supabase
    .from('workouts')
    .select('id, user_id, name, started_at, finished_at')
    .eq('user_id', userId)
    .is('finished_at', null)
    .order('started_at', { ascending: false })

  if (!rows || rows.length === 0) return null

  // Tek sorguda tüm açık antrenmanlar için set sayısını al
  const ids = rows.map(r => r.id)
  const { data: setRows } = await supabase
    .from('workout_sets')
    .select('workout_id')
    .in('workout_id', ids)

  const setCounts = (setRows ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.workout_id] = (acc[s.workout_id] ?? 0) + 1
    return acc
  }, {})

  const now = Date.now()
  let active: ActiveWorkoutRow | null = null
  const toDelete: string[] = []
  const toClose: { id: string; finishAt: string }[] = []

  for (const row of rows as ActiveWorkoutRow[]) {
    const setCount = setCounts[row.id] ?? 0
    const startedMs = new Date(row.started_at).getTime()
    const elapsed = now - startedMs

    if (setCount === 0) {
      // Boş ve hiç dokunulmamış → kalıcı sil (yaşa bakma)
      toDelete.push(row.id)
      continue
    }

    if (elapsed >= ACTIVE_WORKOUT_MAX_MS) {
      // Eski + set var → kapat (silme; veriyi koru)
      toClose.push({
        id: row.id,
        finishAt: new Date(startedMs + ACTIVE_WORKOUT_MAX_MS).toISOString(),
      })
    } else if (!active) {
      active = row
    }
  }

  // Best-effort temizlik — paralel, hata yutulur
  await Promise.all([
    toDelete.length > 0
      ? supabase.from('workouts').delete().in('id', toDelete)
      : Promise.resolve(),
    ...toClose.map(({ id, finishAt }) =>
      supabase.from('workouts').update({ finished_at: finishAt }).eq('id', id)
    ),
  ])

  return active
}
