'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, X, Star, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Exercise, MuscleGroup } from '@/types'
import { cn } from '@/lib/utils'

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}

export function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [query, setQuery] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [recentIds, setRecentIds] = useState<string[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [{ data: ex }, { data: mg }, { data: recent }] = await Promise.all([
      supabase
        .from('exercises')
        .select('*, muscle_group:muscle_groups(*)')
        .order('is_favorite', { ascending: false })
        .order('name'),
      supabase.from('muscle_groups').select('*').order('name'),
      supabase
        .from('workout_sets')
        .select('exercise_id, completed_at')
        .order('completed_at', { ascending: false })
        .limit(200),
    ])

    setExercises(ex ?? [])
    setMuscleGroups(mg ?? [])

    const seen = new Set<string>()
    const recentOrdered: string[] = []
    for (const r of recent ?? []) {
      if (r.exercise_id && !seen.has(r.exercise_id)) {
        seen.add(r.exercise_id)
        recentOrdered.push(r.exercise_id)
        if (recentOrdered.length >= 12) break
      }
    }
    setRecentIds(recentOrdered)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-4 border-b border-stone-900">
        <div className="flex-1 flex items-center gap-2.5 bg-stone-900 rounded-xl px-3.5 h-11 border border-stone-800/80">
          <Search size={16} className="text-stone-500 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Egzersiz ara"
            className="flex-1 bg-transparent text-stone-100 placeholder-stone-600 outline-none text-[15px]"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-stone-500 hover:text-stone-300">
              <X size={15} />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="h-11 w-11 flex items-center justify-center rounded-xl bg-stone-900 text-stone-400 border border-stone-800/80 hover:bg-stone-800 hover:text-stone-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Muscle group filter */}
      <div className="flex gap-1.5 px-4 py-3 overflow-x-auto scrollbar-none border-b border-stone-900">
        <button
          onClick={() => setSelectedGroup(null)}
          className={cn(
            'shrink-0 px-3.5 h-8 rounded-full text-[13px] font-medium transition-all',
            !selectedGroup
              ? 'bg-stone-100 text-stone-900'
              : 'bg-stone-900 text-stone-400 border border-stone-800/80 hover:text-stone-200'
          )}
        >
          Tümü
        </button>
        {muscleGroups.map(mg => (
          <button
            key={mg.id}
            onClick={() => setSelectedGroup(mg.id === selectedGroup ? null : mg.id)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-3.5 h-8 rounded-full text-[13px] font-medium transition-all',
              selectedGroup === mg.id
                ? 'bg-stone-100 text-stone-900'
                : 'bg-stone-900 text-stone-400 border border-stone-800/80 hover:text-stone-200'
            )}
          >
            <span>{mg.icon}</span>
            <span>{mg.name}</span>
          </button>
        ))}
      </div>

      {/* Grid list */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[88px] rounded-xl bg-stone-900/60 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-stone-500 gap-2">
            <Search size={28} className="text-stone-700" />
            <p className="text-sm">Egzersiz bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-6">
            {recentExercises.length > 0 && (
              <Section icon={<Clock size={11} />} label="Son Kullanılan" exercises={recentExercises} onSelect={onSelect} />
            )}
            {favorites.length > 0 && (
              <Section icon={<Star size={11} />} label="Favoriler" exercises={favorites} onSelect={onSelect} />
            )}
            {rest.length > 0 && (
              <Section label="Tüm Egzersizler" exercises={rest} onSelect={onSelect} />
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
  onSelect,
}: {
  icon?: React.ReactNode
  label: string
  exercises: Exercise[]
  onSelect: (e: Exercise) => void
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-500 uppercase tracking-[0.1em] px-1 pb-2.5">
        {icon}
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {exercises.map(e => (
          <ExerciseTile key={e.id} exercise={e} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

function ExerciseTile({
  exercise,
  onSelect,
}: {
  exercise: Exercise
  onSelect: (e: Exercise) => void
}) {
  const mg = exercise.muscle_group as MuscleGroup | undefined
  return (
    <button
      onClick={() => onSelect(exercise)}
      className="relative flex flex-col items-start gap-2 p-3.5 rounded-xl bg-stone-900/60 border border-stone-800/80 hover:border-stone-700 hover:bg-stone-900 active:scale-[0.98] transition-all text-left min-h-[96px]"
    >
      {exercise.is_favorite && (
        <Star
          size={11}
          className="absolute top-2.5 right-2.5 text-amber-400"
          fill="currentColor"
        />
      )}
      <span className="text-2xl">{exercise.icon}</span>
      <span className="text-stone-50 text-[13px] font-medium leading-tight line-clamp-2">
        {exercise.name}
      </span>
      {mg && (
        <span className="text-[10px] text-stone-500 mt-auto leading-tight">
          {mg.name} · <span className="text-stone-600">{exercise.equipment}</span>
        </span>
      )}
    </button>
  )
}
