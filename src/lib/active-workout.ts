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
 * 2 saatten eski açık antrenmanlar otomatik olarak `started_at + 2 saat` ile kapatılır.
 *
 * Tek bir aktif antrenman varsayımı: en yeni `finished_at IS NULL` olanı döner;
 * daha eski açık kayıtlar varsa hepsini auto-close eder.
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

  const now = Date.now()
  let active: ActiveWorkoutRow | null = null
  const toClose: { id: string; finishAt: string }[] = []

  for (const row of rows as ActiveWorkoutRow[]) {
    const startedMs = new Date(row.started_at).getTime()
    const elapsed = now - startedMs
    if (elapsed >= ACTIVE_WORKOUT_MAX_MS) {
      // Sınırı aşan: started_at + 2 saat ile bitir
      toClose.push({
        id: row.id,
        finishAt: new Date(startedMs + ACTIVE_WORKOUT_MAX_MS).toISOString(),
      })
    } else if (!active) {
      // En yeni hâlâ-aktif kayıt
      active = row
    }
  }

  // Best-effort auto-close (paralel, hata sessizce geçilir)
  await Promise.all(
    toClose.map(({ id, finishAt }) =>
      supabase.from('workouts').update({ finished_at: finishAt }).eq('id', id)
    )
  )

  return active
}
