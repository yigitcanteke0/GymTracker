'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { MuscleGroup, Equipment } from '@/types'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Eyebrow } from '@/components/ui/eyebrow'
import { cn } from '@/lib/utils'

const ICONS = ['🏋️', '💪', '🔄', '⬆️', '⬇️', '↔️', '🦵', '🧘', '🏃', '⚙️', '🔨', '💀', '🤸']
const EQUIPMENT: { value: Equipment; label: string }[] = [
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'cable', label: 'Kablo' },
  { value: 'machine', label: 'Makine' },
  { value: 'bodyweight', label: 'Vücut Ağırlığı' },
  { value: 'other', label: 'Diğer' },
]

interface AddExerciseModalProps {
  muscleGroups: MuscleGroup[]
  onClose: () => void
  onSaved: () => void
}

export function AddExerciseModal({
  muscleGroups,
  onClose,
  onSaved,
}: AddExerciseModalProps) {
  const [name, setName] = useState('')
  const [muscleGroupId, setMuscleGroupId] = useState('')
  const [equipment, setEquipment] = useState<Equipment>('barbell')
  const [icon, setIcon] = useState('🏋️')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Egzersiz adı zorunlu')
      return
    }
    setSaving(true)
    setError('')
    const {
      data: { user },
    } = await supabase.auth.getUser()
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end animate-fade-in">
      <div className="w-full bg-bg rounded-t-3xl shadow-[0_-12px_48px_rgb(0_0_0_/_0.5)] p-5 pt-3 space-y-5 max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Drag handle */}
        <div className="flex justify-center pb-1">
          <div className="h-1 w-10 rounded-full bg-fg-quaternary/40" />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-fg font-semibold text-[17px] tracking-[-0.01em]">
            Yeni Egzersiz
          </h2>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="w-8 h-8 rounded-lg bg-surface-2 text-fg-tertiary shadow-[inset_0_0_0_0.5px_var(--color-border)] flex items-center justify-center hover:text-fg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Eyebrow>Egzersiz Adı</Eyebrow>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ör. Bulgarian Split Squat"
            className="w-full bg-surface-2 text-fg rounded-[14px] px-4 h-12 outline-none shadow-[inset_0_0_0_0.5px_var(--color-border)] focus:shadow-[inset_0_0_0_1px_var(--color-accent-500)] transition-shadow placeholder:text-fg-tertiary text-[14px] font-medium tracking-[-0.005em]"
          />
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <Eyebrow>İkon</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map(i => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={cn(
                  'h-10 w-10 rounded-lg text-xl flex items-center justify-center transition-all active:scale-90',
                  icon === i
                    ? 'bg-accent-soft shadow-[inset_0_0_0_1px_var(--color-accent-500)]'
                    : 'bg-surface-2 shadow-[inset_0_0_0_0.5px_var(--color-border)]'
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Muscle group */}
        <div className="space-y-2">
          <Eyebrow>Kas Grubu</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {muscleGroups.map(mg => (
              <Chip
                key={mg.id}
                active={muscleGroupId === mg.id}
                onClick={() => setMuscleGroupId(mg.id === muscleGroupId ? '' : mg.id)}
              >
                {mg.name}
              </Chip>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div className="space-y-2">
          <Eyebrow>Ekipman</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {EQUIPMENT.map(eq => (
              <Chip
                key={eq.value}
                active={equipment === eq.value}
                onClick={() => setEquipment(eq.value)}
              >
                {eq.label}
              </Chip>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-[13px] px-3 py-2 rounded-lg bg-danger/10 text-danger shadow-[inset_0_0_0_0.5px_rgb(220_38_38_/_0.3)]">
            {error}
          </p>
        )}

        <Button
          variant="primary"
          size="lg"
          full
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Kaydediliyor…' : 'Egzersiz Kaydet'}
        </Button>
      </div>
    </div>
  )
}
