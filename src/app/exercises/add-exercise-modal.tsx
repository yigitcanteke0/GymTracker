'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { MuscleGroup, Equipment } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ICONS = ['🏋️', '💪', '🔄', '⬆️', '⬇️', '↔️', '🦵', '🧘', '🏃', '⚙️', '🔨', '💀', '🤸']
const EQUIPMENT: { value: Equipment; label: string }[] = [
  { value: 'barbell',    label: 'Barbell' },
  { value: 'dumbbell',   label: 'Dumbbell' },
  { value: 'cable',      label: 'Kablo' },
  { value: 'machine',    label: 'Makine' },
  { value: 'bodyweight', label: 'Vücut Ağırlığı' },
  { value: 'other',      label: 'Diğer' },
]

interface AddExerciseModalProps {
  muscleGroups: MuscleGroup[]
  onClose: () => void
  onSaved: () => void
}

export function AddExerciseModal({ muscleGroups, onClose, onSaved }: AddExerciseModalProps) {
  const [name, setName] = useState('')
  const [muscleGroupId, setMuscleGroupId] = useState('')
  const [equipment, setEquipment] = useState<Equipment>('barbell')
  const [icon, setIcon] = useState('🏋️')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleSave = async () => {
    if (!name.trim()) { setError('Egzersiz adı zorunlu'); return }
    setSaving(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: err } = await supabase.from('exercises').insert({
      user_id: user.id,
      name: name.trim(),
      muscle_group_id: muscleGroupId || null,
      equipment,
      icon,
      is_favorite: false,
    })

    if (err) {
      setError(err.message)
      setSaving(false)
    } else {
      onSaved()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-end animate-fade-up">
      <div className="w-full bg-stone-950 rounded-t-3xl border-t border-stone-800 p-5 pt-4 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center -mt-1 mb-2">
          <div className="h-1 w-10 rounded-full bg-stone-700" />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-stone-50 font-semibold text-[17px] tracking-tight">
            Yeni Egzersiz
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-stone-900 text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.08em] block px-0.5">
            Egzersiz Adı
          </label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ör. Bulgarian Split Squat"
            className="w-full bg-stone-900 text-stone-100 rounded-xl px-4 h-12 placeholder-stone-600 outline-none border border-stone-800/80 focus:border-accent-600/60 transition-colors"
          />
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.08em] block px-0.5">
            İkon
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map(i => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={cn(
                  'h-10 w-10 rounded-lg text-xl flex items-center justify-center transition-all active:scale-90',
                  icon === i
                    ? 'bg-accent-600/20 ring-1 ring-accent-500'
                    : 'bg-stone-900 border border-stone-800/80 hover:bg-stone-800'
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Muscle group */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.08em] block px-0.5">
            Kas Grubu
          </label>
          <div className="flex flex-wrap gap-1.5">
            {muscleGroups.map(mg => (
              <button
                key={mg.id}
                onClick={() => setMuscleGroupId(mg.id === muscleGroupId ? '' : mg.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 h-9 rounded-lg text-[13px] font-medium transition-all active:scale-[0.97]',
                  muscleGroupId === mg.id
                    ? 'bg-stone-100 text-stone-900'
                    : 'bg-stone-900 text-stone-300 border border-stone-800/80 hover:bg-stone-800'
                )}
              >
                {mg.icon} {mg.name}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.08em] block px-0.5">
            Ekipman
          </label>
          <div className="flex flex-wrap gap-1.5">
            {EQUIPMENT.map(eq => (
              <button
                key={eq.value}
                onClick={() => setEquipment(eq.value)}
                className={cn(
                  'px-3 h-9 rounded-lg text-[13px] font-medium transition-all active:scale-[0.97]',
                  equipment === eq.value
                    ? 'bg-stone-100 text-stone-900'
                    : 'bg-stone-900 text-stone-300 border border-stone-800/80 hover:bg-stone-800'
                )}
              >
                {eq.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-[13px] px-1 py-2 rounded-lg bg-red-950/30 border border-red-900/40">
            {error}
          </p>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Kaydediliyor…' : 'Egzersiz Kaydet'}
        </Button>
      </div>
    </div>
  )
}
