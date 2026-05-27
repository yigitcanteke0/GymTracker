import type { SupabaseClient } from '@supabase/supabase-js'

export interface PreviousSet {
  weight_kg: number
  reps: number
  rir: number | null
  set_number: number
}

export interface LastPerformance {
  workoutId: string
  workoutDate: string
  sets: PreviousSet[]
}

export type LastPerformanceMap = Record<string, LastPerformance>

/**
 * Her egzersiz için, kullanıcının en son yaptığı antrenmandaki setleri döner.
 * En çok 500 set fetch edilir (RLS ile sadece auth.uid()'ye ait olanlar gelir).
 *
 * `excludeWorkoutId` verilirse o antrenmana ait setler atlanır — aktif/devam eden
 * bir antrenmanda "önceki performans" göstermek için kullanılır.
 */
export async function fetchLastPerformanceMap(
  supabase: SupabaseClient,
  options: { excludeWorkoutId?: string | null; limit?: number } = {}
): Promise<LastPerformanceMap> {
  const { excludeWorkoutId, limit = 500 } = options
  let query = supabase
    .from('workout_sets')
    .select('exercise_id, workout_id, set_number, weight_kg, reps, rir, completed_at')
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (excludeWorkoutId) {
    query = query.neq('workout_id', excludeWorkoutId)
  }

  const { data } = await query

  const map: LastPerformanceMap = {}

  // completed_at DESC sırasında — bir egzersiz için ilk gördüğümüz workout, en son workout.
  for (const set of data ?? []) {
    const eid = set.exercise_id as string
    if (!eid) continue
    if (!map[eid]) {
      map[eid] = {
        workoutId: set.workout_id,
        workoutDate: set.completed_at,
        sets: [],
      }
    }
    // Sadece en son workout'un setlerini topla
    if (map[eid].workoutId === set.workout_id) {
      map[eid].sets.push({
        weight_kg: Number(set.weight_kg),
        reps: set.reps ?? 0,
        rir: set.rir,
        set_number: set.set_number,
      })
    }
  }

  // Her egzersizin setlerini set_number'a göre sırala
  for (const eid in map) {
    map[eid].sets.sort((a, b) => a.set_number - b.set_number)
  }

  return map
}

/**
 * Tile/etiket için kompakt özet metni.
 * Örnekler: "10kg × 5", "3 × 10kg × 5", "3 set · 12kg × 6"
 */
export function summarizeLastPerformance(perf: LastPerformance): string {
  const { sets } = perf
  if (sets.length === 0) return ''

  const first = sets[0]
  const allUniform = sets.every(
    s => s.weight_kg === first.weight_kg && s.reps === first.reps
  )

  if (allUniform) {
    if (sets.length === 1) {
      return `${formatWeight(first.weight_kg)}kg × ${first.reps}`
    }
    return `${sets.length} × ${formatWeight(first.weight_kg)}kg × ${first.reps}`
  }

  // En ağır seti seç
  const heaviest = sets.reduce(
    (best, s) => (s.weight_kg > best.weight_kg ? s : best),
    sets[0]
  )
  return `${sets.length} set · ${formatWeight(heaviest.weight_kg)}kg × ${heaviest.reps}`
}

function formatWeight(w: number): string {
  // 10.0 → "10", 12.5 → "12.5"
  return Number.isInteger(w) ? String(w) : w.toString()
}
