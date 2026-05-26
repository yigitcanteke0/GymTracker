'use client'

import { Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { exportToCSV } from '@/lib/utils'

interface ExportButtonProps {
  workoutId: string
  workoutName: string | null
}

export function WorkoutExportButton({ workoutId, workoutName }: ExportButtonProps) {
  const handleExport = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('workout_sets')
      .select('*, exercise:exercises(name, equipment, muscle_group:muscle_groups(name))')
      .eq('workout_id', workoutId)
      .order('exercise_order')
      .order('set_number')

    if (!data) return

    const rows = data.map(s => ({
      egzersiz: (s.exercise as { name?: string })?.name ?? '',
      kas_grubu: ((s.exercise as { muscle_group?: { name?: string } })?.muscle_group as { name?: string })?.name ?? '',
      ekipman: (s.exercise as { equipment?: string })?.equipment ?? '',
      set_tipi: s.set_type,
      set_no: s.set_number,
      agirlik_kg: s.weight_kg,
      tekrar: s.reps,
      rir: s.rir,
      hacim_kg: s.weight_kg * (s.reps ?? 0),
      tamamlama: s.completed_at,
    }))

    exportToCSV(rows, `antrenman-${workoutName ?? workoutId}`)
  }

  return (
    <button
      onClick={handleExport}
      className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all"
    >
      <Download size={16} />
    </button>
  )
}
