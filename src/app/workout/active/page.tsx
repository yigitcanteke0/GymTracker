'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Check, Pencil, Timer } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ActiveExercise, ActiveSet, Exercise, SetType } from '@/types'
import type { PreviousSet } from '@/lib/last-performance'
import { ExerciseCard } from '@/components/workout/exercise-card'
import { ExercisePicker } from '@/components/workout/exercise-picker'
import { SetComposer } from '@/components/workout/set-composer'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { LongPressButton } from '@/components/ui/long-press-button'

export default function ActiveWorkoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const startedAt = useRef(new Date().toISOString())

  const [workoutName, setWorkoutName] = useState('')
  const [exercises, setExercises] = useState<ActiveExercise[]>([])
  const [previousSetsMap, setPreviousSetsMap] = useState<Record<string, PreviousSet[]>>({})
  const [activeBlock, setActiveBlock] = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)

  const [elapsed, setElapsed] = useState(0)
  const [resting, setResting] = useState(false)
  const [restRemain, setRestRemain] = useState(0)
  const [editingName, setEditingName] = useState(false)

  // ── Clocks ────────────────────────────────────────────────────────
  useEffect(() => {
    const start = new Date(startedAt.current).getTime()
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!resting) return
    const id = setInterval(() => {
      setRestRemain(r => {
        if (r <= 1) {
          setResting(false)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [resting])

  // ── Derived state ─────────────────────────────────────────────────
  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0)
  const doneSets = exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0)

  const activeBlockData = exercises[activeBlock]
  const activeSetIdx = useMemo(() => {
    if (!activeBlockData) return -1
    const idx = activeBlockData.sets.findIndex(s => !s.completed)
    return idx === -1 ? activeBlockData.sets.length - 1 : idx
  }, [activeBlockData])

  // ── Handlers ──────────────────────────────────────────────────────
  const handleSelectExercise = useCallback(
    (exercise: Exercise, previousSets?: PreviousSet[]) => {
      if (previousSets && previousSets.length > 0) {
        setPreviousSetsMap(prev => ({ ...prev, [exercise.id]: previousSets }))
      }
      const firstPrev = previousSets?.[0]

      setExercises(prev => {
        const order = prev.length + 1
        const newExercise: ActiveExercise = {
          exercise,
          exercise_order: order,
          sets: [
            {
              exercise_order: order,
              set_number: 1,
              weight_kg: firstPrev?.weight_kg ?? 0,
              reps: firstPrev?.reps ?? 10,
              rir: firstPrev?.rir ?? 2,
              set_type: 'working' as SetType,
              completed: false,
            },
          ],
        }
        return [...prev, newExercise]
      })
      setActiveBlock(exercises.length) // new exercise becomes active
      setShowPicker(false)
    },
    [exercises.length]
  )

  const updateActiveSet = useCallback(
    (patch: Partial<ActiveSet>) => {
      setExercises(prev =>
        prev.map((e, bi) => {
          if (bi !== activeBlock) return e
          return {
            ...e,
            sets: e.sets.map((s, i) => (i === activeSetIdx ? { ...s, ...patch } : s)),
          }
        })
      )
    },
    [activeBlock, activeSetIdx]
  )

  const handleSetClick = useCallback((blockIdx: number, setIdx: number) => {
    setActiveBlock(blockIdx)
    // tapping a different set: leave activeSetIdx derivation, but
    // override by un-completing nothing — we just refocus the block.
    void setIdx
  }, [])

  const handleAddSet = useCallback((blockIdx: number) => {
    setExercises(prev =>
      prev.map((e, bi) => {
        if (bi !== blockIdx) return e
        const last = e.sets[e.sets.length - 1]
        return {
          ...e,
          sets: [
            ...e.sets,
            {
              exercise_order: e.exercise_order,
              set_number: e.sets.length + 1,
              weight_kg: last?.weight_kg ?? 0,
              reps: last?.reps ?? 10,
              rir: last?.rir ?? 2,
              set_type: 'working' as SetType,
              completed: false,
            },
          ],
        }
      })
    )
  }, [])

  const completeActiveSet = useCallback(() => {
    if (!activeBlockData || activeSetIdx < 0) return
    setExercises(prev =>
      prev.map((e, bi) => {
        if (bi !== activeBlock) return e
        return {
          ...e,
          sets: e.sets.map((s, i) => (i === activeSetIdx ? { ...s, completed: true } : s)),
        }
      })
    )
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(20)
    }
    setRestRemain(90)
    setResting(true)

    // Advance to next exercise if this was the last set of the block
    const block = exercises[activeBlock]
    if (block) {
      const allDone = block.sets.every((s, i) => i === activeSetIdx || s.completed)
      if (allDone && activeBlock < exercises.length - 1) {
        setTimeout(() => setActiveBlock(b => b + 1), 100)
      }
    }
  }, [activeBlockData, activeBlock, activeSetIdx, exercises])

  const handleFinish = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: workout, error: wError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: workoutName || null,
          started_at: startedAt.current,
          finished_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (wError || !workout) throw wError

      const allSets = exercises.flatMap(eg =>
        eg.sets
          .filter(s => s.completed)
          .map(s => ({
            workout_id: workout.id,
            exercise_id: eg.exercise.id,
            exercise_order: eg.exercise_order,
            set_number: s.set_number,
            weight_kg: s.weight_kg,
            reps: s.reps,
            rir: s.rir,
            set_type: s.set_type,
          }))
      )

      if (allSets.length > 0) {
        const { error: sError } = await supabase.from('workout_sets').insert(allSets)
        if (sError) throw sError
      }

      router.push(`/workout/${workout.id}`)
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────
  if (showPicker) {
    return (
      <ExercisePicker
        onSelect={handleSelectExercise}
        onClose={() => setShowPicker(false)}
      />
    )
  }

  const elapsedMin = Math.floor(elapsed / 60)
  const elapsedSec = elapsed % 60

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Sticky header */}
      <div className="sticky top-0 z-[8] px-3.5 pt-2.5 pb-3 bg-gradient-to-b from-bg via-bg/95 to-transparent">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push('/')}
            aria-label="Kapat"
            className="w-9 h-9 rounded-xl bg-surface-2 text-fg-secondary shadow-[inset_0_0_0_0.5px_var(--color-border)] flex items-center justify-center"
          >
            <X size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <Eyebrow>Aktif Antrenman</Eyebrow>
            {editingName ? (
              <input
                autoFocus
                value={workoutName}
                onChange={e => setWorkoutName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => {
                  if (e.key === 'Enter') setEditingName(false)
                }}
                placeholder="Antrenman adı"
                className="w-full bg-transparent text-fg font-semibold text-[17px] tracking-[-0.01em] placeholder-fg-quaternary outline-none"
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="text-fg font-semibold text-[17px] tracking-[-0.01em] inline-flex items-center gap-1.5"
              >
                <span>{workoutName || 'Yeni Antrenman'}</span>
                <Pencil size={13} className="text-fg-tertiary" />
              </button>
            )}
          </div>
          <div className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-surface-2 shadow-[inset_0_0_0_0.5px_var(--color-border)] text-[14px] font-semibold text-fg-secondary tnum">
            <Timer size={14} className="text-fg-tertiary" />
            {elapsedMin}:{String(elapsedSec).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Progress */}
      {totalSets > 0 && (
        <div className="px-3.5 pb-2">
          <div className="flex justify-between items-baseline mb-1.5">
            <Eyebrow>İlerleme</Eyebrow>
            <span className="text-[12px] font-semibold text-fg-secondary tnum">
              {doneSets}/{totalSets} set
            </span>
          </div>
          <div className="h-[5px] rounded-full bg-surface-3 shadow-[inset_0_0_0_0.5px_var(--color-border)] overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-accent-700 to-accent-500 rounded-full transition-[width] duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
              style={{
                width: `${(doneSets / totalSets) * 100}%`,
                boxShadow: '0 0 12px var(--color-accent-950)',
              }}
            />
          </div>
        </div>
      )}

      {/* Exercise list */}
      <div className="flex-1 overflow-auto px-3.5 pb-5 flex flex-col gap-2.5">
        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-surface-2 shadow-[inset_0_0_0_0.5px_var(--color-border)] flex items-center justify-center">
              <Plus size={32} className="text-fg-tertiary" strokeWidth={2.2} />
            </div>
            <div className="space-y-1">
              <p className="text-fg font-semibold text-lg tracking-tight">
                Antrenman başladı
              </p>
              <p className="text-fg-tertiary text-sm">İlk egzersizini ekle</p>
            </div>
          </div>
        ) : (
          exercises.map((eg, idx) => (
            <ExerciseCard
              key={`${eg.exercise.id}-${eg.exercise_order}`}
              exerciseGroup={eg}
              previousSets={previousSetsMap[eg.exercise.id]}
              isCurrent={idx === activeBlock}
              activeSetIdx={idx === activeBlock ? activeSetIdx : -1}
              onSetClick={(setIdx) => handleSetClick(idx, setIdx)}
              onAddSet={() => handleAddSet(idx)}
            />
          ))
        )}

        {/* Action row above composer */}
        {exercises.length > 0 && (
          <div className="flex gap-2.5 pt-1 pb-2">
            <Button
              variant="secondary"
              size="md"
              full
              onClick={() => setShowPicker(true)}
            >
              <Plus size={16} strokeWidth={2.5} />
              Egzersiz Ekle
            </Button>
            <LongPressButton
              variant="success"
              size="lg"
              className="flex-1"
              onComplete={handleFinish}
              disabled={saving}
            >
              <Check size={16} strokeWidth={2.5} />
              {saving ? 'Kaydediliyor…' : 'Bitir — Basılı Tut'}
            </LongPressButton>
          </div>
        )}

        {exercises.length === 0 && (
          <div className="pt-2">
            <Button
              variant="secondary"
              size="lg"
              full
              onClick={() => setShowPicker(true)}
            >
              <Plus size={18} strokeWidth={2.5} />
              Egzersiz Ekle
            </Button>
          </div>
        )}
      </div>

      {/* Bottom composer */}
      {activeBlockData && activeSetIdx >= 0 && (
        <SetComposer
          exerciseGroup={activeBlockData}
          setIdx={activeSetIdx}
          previousSets={previousSetsMap[activeBlockData.exercise.id]}
          resting={resting}
          restRemain={restRemain}
          onSkipRest={() => {
            setResting(false)
            setRestRemain(0)
          }}
          onUpdate={updateActiveSet}
          onComplete={completeActiveSet}
        />
      )}
    </div>
  )
}
