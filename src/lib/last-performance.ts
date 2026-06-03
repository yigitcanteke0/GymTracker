import type { SupabaseClient } from '@supabase/supabase-js'
import type { WeightUnit } from '@/types'

export interface PreviousSet {
  weight_kg: number
  weight_unit: WeightUnit
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
    .select(
      'exercise_id, workout_id, set_number, weight_kg, weight_unit, reps, rir, completed_at'
    )
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (excludeWorkoutId) {
    query = query.neq('workout_id', excludeWorkoutId)
  }

  const { data } = await query

  const map: LastPerformanceMap = {}

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
    if (map[eid].workoutId === set.workout_id) {
      map[eid].sets.push({
        weight_kg: Number(set.weight_kg),
        weight_unit: (set.weight_unit as WeightUnit) ?? 'kg',
        reps: set.reps ?? 0,
        rir: set.rir,
        set_number: set.set_number,
      })
    }
  }

  for (const eid in map) {
    map[eid].sets.sort((a, b) => a.set_number - b.set_number)
  }

  return map
}

/**
 * Tile/etiket için kompakt özet metni — birimi taşır.
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
      return `${formatNum(first.weight_kg)}${first.weight_unit} × ${first.reps}`
    }
    return `${sets.length} × ${formatNum(first.weight_kg)}${first.weight_unit} × ${first.reps}`
  }

  const heaviest = sets.reduce(
    (best, s) => (s.weight_kg > best.weight_kg ? s : best),
    sets[0]
  )
  return `${sets.length} set · ${formatNum(heaviest.weight_kg)}${heaviest.weight_unit} × ${heaviest.reps}`
}

function formatNum(w: number): string {
  return Number.isInteger(w) ? String(w) : w.toString()
}
