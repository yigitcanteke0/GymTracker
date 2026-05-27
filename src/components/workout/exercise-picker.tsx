'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, X, Star, Clock, Timer } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Exercise, MuscleGroup } from '@/types'
import { cn } from '@/lib/utils'
import {
  fetchLastPerformanceMap,
  summarizeLastPerformance,
  type LastPerformance,
  type LastPerformanceMap,
  type PreviousSet,
} from '@/lib/last-performance'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Chip } from '@/components/ui/chip'
import { GlyphTile } from '@/components/glyphs/glyph'
import { exerciseGlyph } from '@/lib/glyph-map'

interface ExercisePickerProps {
  onSelect: (exercise: Exercise, previousSets?: PreviousSet[]) => void
  onClose: () => void
}

export function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [query, setQuery] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [lastPerfMap, setLastPerfMap] = useState<LastPerformanceMap>({})
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [{ data: ex }, { data: mg }, perfMap] = await Promise.all([
      supabase
        .from('exercises')
        .select('*, muscle_group:muscle_groups(*)')
        .order('is_favorite', { ascending: false })
        .order('name'),
      supabase.from('muscle_groups').select('*').order('name'),
      fetchLastPerformanceMap(supabase),
    ])

    setExercises(ex ?? [])
    setMuscleGroups(mg ?? [])
    setLastPerfMap(perfMap)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Son kullanılan egzersizler — workoutDate DESC
  const recentIds = useMemo(
    () =>
      Object.entries(lastPerfMap)
        .sort((a, b) => (b[1].workoutDate > a[1].workoutDate ? 1 : -1))
        .map(([id]) => id)
        .slice(0, 12),
    [lastPerfMap]
  )

  const filtered = useMemo(
    () =>
      exercises.filter(e => {
        const matchesQuery = e.name.toLowerCase().includes(query.toLowerCase())
        const matchesGroup = !selectedGroup || e.muscle_group_id === selectedGroup
        return matchesQuery && matchesGroup
      }),
    [exercises, query, selectedGroup]
  )

  const recentExercises = useMemo(() => {
    const map = new Map(filtered.map(e => [e.id, e]))
    return recentIds
      .map(id => map.get(id))
      .filter((e): e is Exercise => !!e)
  }, [recentIds, filtered])

  const recentSet = new Set(recentExercises.map(e => e.id))
  const favorites = filtered.filter(e => e.is_favorite && !recentSet.has(e.id))
  const favoriteSet = new Set(favorites.map(e => e.id))
  const rest = filtered.filter(e => !recentSet.has(e.id) && !favoriteSet.has(e.id))

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise, lastPerfMap[exercise.id]?.sets)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-2.5 px-3.5 pt-3 pb-2.5">
        <h2 className="text-[17px] font-semibold text-fg tracking-[-0.01em]">
          Egzersiz Seç
        </h2>
        <button
          onClick={onClose}
          aria-label="İptal"
          className="text-fg-tertiary text-[14px] font-semibold"
        >
          İptal
        </button>
      </div>

      {/* Search */}
      <div className="px-3.5 pb-2.5">
        <div className="h-11 rounded-[14px] bg-surface-2 shadow-[inset_0_0_0_0.5px_var(--color-border)] flex items-center px-3 gap-2">
          <Search size={16} className="text-fg-tertiary shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Egzersiz ara"
            className="flex-1 bg-transparent text-fg outline-none text-[14px] font-medium tracking-[-0.005em] placeholder:text-fg-tertiary"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Temizle"
              className="text-fg-tertiary"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Muscle group filter */}
      <div className="flex gap-1.5 px-3.5 pb-3 overflow-x-auto scrollbar-none">
        <Chip active={!selectedGroup} onClick={() => setSelectedGroup(null)}>
          Tümü
        </Chip>
        {muscleGroups.map(mg => (
          <Chip
            key={mg.id}
            active={selectedGroup === mg.id}
            onClick={() =>
              setSelectedGroup(mg.id === selectedGroup ? null : mg.id)
            }
          >
            {mg.name}
          </Chip>
        ))}
      </div>

      {/* Grid list */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-[112px] rounded-[14px] bg-surface-dim animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-fg-tertiary">
            <Search size={28} className="text-fg-quaternary" />
            <p className="text-sm">Egzersiz bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-5">
            {recentExercises.length > 0 && (
              <Section
                icon={<Clock size={11} />}
                label="Son Kullanılan"
                exercises={recentExercises}
                lastPerfMap={lastPerfMap}
                onSelect={handleSelect}
              />
            )}
            {favorites.length > 0 && (
              <Section
                icon={
                  <Star
                    size={11}
                    fill="currentColor"
                    className="text-amber-500"
                  />
                }
                label="Favoriler"
                exercises={favorites}
                lastPerfMap={lastPerfMap}
                onSelect={handleSelect}
              />
            )}
            {rest.length > 0 && (
              <Section
                label="Tüm Egzersizler"
                exercises={rest}
                lastPerfMap={lastPerfMap}
                onSelect={handleSelect}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Section({
  icon,
  label,
  exercises,
  lastPerfMap,
  onSelect,
}: {
  icon?: React.ReactNode
  label: string
  exercises: Exercise[]
  lastPerfMap: LastPerformanceMap
  onSelect: (e: Exercise) => void
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 pb-2.5">
        {icon}
        <Eyebrow>{label}</Eyebrow>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {exercises.map(e => (
          <ExerciseTile
            key={e.id}
            exercise={e}
            lastPerf={lastPerfMap[e.id]}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

function ExerciseTile({
  exercise,
  lastPerf,
  onSelect,
}: {
  exercise: Exercise
  lastPerf?: LastPerformance
  onSelect: (e: Exercise) => void
}) {
  const mg = exercise.muscle_group as MuscleGroup | undefined
  const glyph = exerciseGlyph(exercise.name, exercise.equipment)
  const summary = lastPerf ? summarizeLastPerformance(lastPerf) : null

  return (
    <button
      onClick={() => onSelect(exercise)}
      className={cn(
        'relative flex flex-col items-start gap-2 p-3 rounded-[14px] text-left',
        'bg-surface shadow-[inset_0_0_0_0.5px_var(--color-border)]',
        'hover:bg-surface-2 transition-colors active:scale-[0.98]'
      )}
    >
      {exercise.is_favorite && (
        <Star
          size={11}
          fill="currentColor"
          className="absolute top-2.5 right-2.5 text-amber-500"
        />
      )}
      <GlyphTile name={glyph} size={40} />
      <div className="w-full">
        <div className="text-[13.5px] font-semibold text-fg tracking-[-0.005em] leading-tight">
          {exercise.name}
        </div>
        <div className="text-[11px] text-fg-tertiary mt-0.5">
          {mg?.name ?? '—'} · {exercise.equipment}
        </div>
      </div>
      {summary && (
        <div className="h-5 px-1.5 rounded-full bg-accent-soft text-accent-300 shadow-[inset_0_0_0_0.5px_var(--color-accent-border)] inline-flex items-center gap-1 text-[9.5px] font-bold tracking-[0.04em] tnum">
          <Timer size={9} />
          {summary}
        </div>
      )}
    </button>
  )
}
