'use client'

import { Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { exportToCSV } from '@/lib/utils'

export function HistoryExportButton() {
  const handleExport = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('workout_sets')
      .select(`
        completed_at,
        set_type, set_number, exercise_order,
        weight_kg, reps, rir,
        exercise:exercises(name, equipment, muscle_group:muscle_groups(name)),
        workout:workouts(name, started_at, finished_at)
      `)
      .order('completed_at')

    if (!data) return

    const rows = data.map(s => {
      const ex = s.exercise as { name?: string; equipment?: string; muscle_group?: { name?: string } } | null
      const wo = s.workout as { name?: string; started_at?: string; finished_at?: string } | null
      return {
        antrenman: wo?.name ?? '',
        tarih: wo?.started_at ?? '',
        egzersiz: ex?.name ?? '',
        kas_grubu: ex?.muscle_group?.name ?? '',
        ekipman: ex?.equipment ?? '',
        set_tipi: s.set_type,
        set_no: s.set_number,
        agirlik_kg: s.weight_kg,
        tekrar: s.reps,
        rir: s.rir,
        hacim_kg: s.weight_kg * (s.reps ?? 0),
      }
    })

    exportToCSV(rows, `tum-antrenmanlar-${new Date().toISOString().slice(0, 10)}`)
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-surface-2 text-fg-secondary shadow-[inset_0_0_0_0.5px_var(--color-border)] hover:text-fg transition-colors text-[12.5px] font-semibold"
    >
      <Download size={13} strokeWidth={2.2} />
      CSV
    </button>
  )
}
