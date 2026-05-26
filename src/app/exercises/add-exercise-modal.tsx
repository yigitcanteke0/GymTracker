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
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end">
      <div className="w-full bg-zinc-900 rounded-t-3xl border-t border-zinc-700 p-5 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Egzersiz Ekle</h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
            <X size={18} />
          </button>
        </div>

        {/* İkon seçici */}
        <div>
          <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wider">İkon</p>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(i => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={cn(
                  'h-10 w-10 rounded-xl text-xl flex items-center justify-center transition-all',
                  icon === i ? 'bg-indigo-600 ring-2 ring-indigo-400' : 'bg-zinc-800'
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* İsim */}
        <div>
          <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wider">Egzersiz Adı</p>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ör. Bulgarian Split Squat"
            className="w-full bg-zinc-800 text-white rounded-xl px-4 h-12 placeholder-zinc-500 outline-none border border-zinc-700 focus:border-indigo-500"
          />
        </div>

        {/* Kas grubu */}
        <div>
          <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wider">Kas Grubu</p>
          <div className="flex flex-wrap gap-2">
            {muscleGroups.map(mg => (
              <button
                key={mg.id}
                onClick={() => setMuscleGroupId(mg.id === muscleGroupId ? '' : mg.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-medium transition-all',
                  muscleGroupId === mg.id ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300'
                )}
              >
                {mg.icon} {mg.name}
              </button>
            ))}
          </div>
        </div>

        {/* Ekipman */}
        <div>
          <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wider">Ekipman</p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map(eq => (
              <button
                key={eq.value}
                onClick={() => setEquipment(eq.value)}
                className={cn(
                  'px-3 h-9 rounded-xl text-sm font-medium transition-all',
                  equipment === eq.value ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300'
                )}
              >
                {eq.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

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
