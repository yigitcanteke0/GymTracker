'use client'

import { useEffect, useState } from 'react'
import { X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Exercise, MuscleGroup, Equipment, WeightUnit } from '@/types'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Eyebrow } from '@/components/ui/eyebrow'
import { KG_PER_LBS } from '@/lib/weight'
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
const UNITS: { value: WeightUnit; label: string }[] = [
  { value: 'kg', label: 'KG' },
  { value: 'lbs', label: 'LBS' },
]

type PastAction = 'leave' | 'relabel' | 'convert'

interface AddExerciseModalProps {
  muscleGroups: MuscleGroup[]
  onClose: () => void
  onSaved: () => void
  /** Verilirse modal **edit** modunda açılır: alanlar dolu gelir, UPDATE atar. */
  exercise?: Exercise
}

export function AddExerciseModal({
  muscleGroups,
  onClose,
  onSaved,
  exercise,
}: AddExerciseModalProps) {
  const isEdit = !!exercise
  const originalUnit = exercise?.weight_unit ?? 'kg'

  const [name, setName] = useState(exercise?.name ?? '')
  const [muscleGroupId, setMuscleGroupId] = useState(exercise?.muscle_group_id ?? '')
  const [equipment, setEquipment] = useState<Equipment>(exercise?.equipment ?? 'barbell')
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(originalUnit)
  const [icon, setIcon] = useState(exercise?.icon ?? '🏋️')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Geçmiş set sayısı + ne yapılacağı (sadece edit modunda anlamlı)
  const [pastSetsCount, setPastSetsCount] = useState<number | null>(null)
  const [pastAction, setPastAction] = useState<PastAction>('leave')

  const supabase = createClient()

  // Edit modunda mount'ta geçmiş set sayısını çek
  useEffect(() => {
    if (!exercise) return
    let mounted = true
    ;(async () => {
      const { count } = await supabase
        .from('workout_sets')
        .select('id', { count: 'exact', head: true })
        .eq('exercise_id', exercise.id)
      if (mounted) setPastSetsCount(count ?? 0)
    })()
    return () => {
      mounted = false
    }
  }, [exercise, supabase])

  const unitChanged = isEdit && weightUnit !== originalUnit

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

    const payload = {
      name: name.trim(),
      muscle_group_id: muscleGroupId || null,
      equipment,
      weight_unit: weightUnit,
      icon,
    }

    const { error: err } = isEdit
      ? await supabase
          .from('exercises')
          .update(payload)
          .eq('id', exercise!.id)
      : await supabase.from('exercises').insert({
          ...payload,
          user_id: user.id,
          is_favorite: false,
        })

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    // Geçmiş setler için isteğe bağlı toplu güncelleme
    if (isEdit && unitChanged && (pastSetsCount ?? 0) > 0 && pastAction !== 'leave') {
      try {
        if (pastAction === 'relabel') {
          // Sayıları olduğu gibi bırak, sadece weight_unit etiketini değiştir
          await supabase
            .from('workout_sets')
            .update({ weight_unit: weightUnit })
            .eq('exercise_id', exercise!.id)
        } else if (pastAction === 'convert') {
          // Sayıları da çevir: KG→LBS ya da LBS→KG
          const factor = weightUnit === 'lbs' ? 1 / KG_PER_LBS : KG_PER_LBS
          const { data: sets } = await supabase
            .from('workout_sets')
            .select('id, weight_kg')
            .eq('exercise_id', exercise!.id)
          if (sets) {
            // Sırayla değil, paralel — RLS scope zaten kullanıcıya kilitli
            await Promise.all(
              sets.map(s =>
                supabase
                  .from('workout_sets')
                  .update({
                    weight_kg: Math.round(Number(s.weight_kg) * factor * 10) / 10,
                    weight_unit: weightUnit,
                  })
                  .eq('id', s.id)
              )
            )
          }
        }
      } catch (e) {
        // Sessizce yut — egzersiz update'i yine de başarılı
        console.error('Past sets bulk update failed:', e)
      }
    }

    onSaved()
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
            {isEdit ? 'Egzersizi Düzenle' : 'Yeni Egzersiz'}
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

        {/* Birim — Weight unit */}
        <div className="space-y-2">
          <Eyebrow>Ağırlık Birimi</Eyebrow>
          <div className="flex gap-1.5">
            {UNITS.map(u => (
              <Chip
                key={u.value}
                active={weightUnit === u.value}
                onClick={() => setWeightUnit(u.value)}
              >
                {u.label}
              </Chip>
            ))}
          </div>
          <p className="text-[11.5px] text-fg-tertiary px-1">
            Yeni setler için varsayılan birim.
          </p>
        </div>

        {/* Geçmiş setler için toplu eylem — sadece edit modunda + birim değiştiyse */}
        {isEdit && unitChanged && (pastSetsCount ?? 0) > 0 && (
          <div className="space-y-2.5 p-3.5 rounded-[14px] bg-surface-dim shadow-[inset_0_0_0_0.5px_var(--color-border)]">
            <div className="flex items-baseline justify-between">
              <Eyebrow tone="accent">Geçmiş Setler</Eyebrow>
              <span className="text-[11px] text-fg-tertiary tnum">
                {pastSetsCount} set · şu an {originalUnit.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <PastActionRow
                active={pastAction === 'leave'}
                title={`Eski birimde kalsın (${originalUnit.toUpperCase()})`}
                desc="Geçmiş veriye dokunma — yeni setler yeni birimi kullanır"
                onClick={() => setPastAction('leave')}
              />
              <PastActionRow
                active={pastAction === 'relabel'}
                title={`Sadece ${weightUnit.toUpperCase()} olarak etiketle`}
                desc="Sayılar aynı kalır, yalnızca birim değişir (yanlış birimde girdiysem)"
                onClick={() => setPastAction('relabel')}
              />
              <PastActionRow
                active={pastAction === 'convert'}
                title={`${weightUnit.toUpperCase()}'ye çevir`}
                desc={
                  weightUnit === 'lbs'
                    ? `Sayılar × ${(1 / KG_PER_LBS).toFixed(4)} ile dönüştürülür (gerçek fiziksel ağırlık aynı kalır)`
                    : `Sayılar × ${KG_PER_LBS.toFixed(4)} ile dönüştürülür (gerçek fiziksel ağırlık aynı kalır)`
                }
                onClick={() => setPastAction('convert')}
              />
            </div>
          </div>
        )}

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
          {saving ? 'Kaydediliyor…' : isEdit ? 'Değişiklikleri Kaydet' : 'Egzersiz Kaydet'}
        </Button>
      </div>
    </div>
  )
}

function PastActionRow({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-start gap-2.5 text-left p-2.5 rounded-[10px] transition-all',
        active
          ? 'bg-accent-soft shadow-[inset_0_0_0_1px_var(--color-accent-500)]'
          : 'bg-surface-2 shadow-[inset_0_0_0_0.5px_var(--color-border)] hover:bg-surface-3'
      )}
    >
      <div
        className={cn(
          'w-4 h-4 mt-0.5 rounded-full shrink-0 flex items-center justify-center',
          active
            ? 'bg-accent-600 text-white'
            : 'bg-transparent shadow-[inset_0_0_0_1.5px_var(--color-border-2)]'
        )}
      >
        {active && <Check size={10} strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-[13px] font-semibold tracking-[-0.005em]',
            active ? 'text-accent-300' : 'text-fg'
          )}
        >
          {title}
        </p>
        <p className="text-[11.5px] text-fg-tertiary mt-0.5 leading-snug">{desc}</p>
      </div>
    </button>
  )
}
