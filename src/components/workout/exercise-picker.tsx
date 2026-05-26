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
  const [recentIds, setRecentIds] = useState<string[]>([]) // sıralı, en son kullanılan ilk
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

    // Sıralı, tekrarsız ID listesi — en son kullanılan ilk
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

  // Filtreden geçen son kullanılanları, sıralı bir şekilde topla
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
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        <div className="flex-1 flex items-center gap-2 bg-zinc-800 rounded-xl px-3 h-11">
          <Search size={18} className="text-zinc-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Egzersiz ara..."
            className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-base"
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X size={16} className="text-zinc-400" />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="h-11 w-11 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300"
        >
          <X size={20} />
        </button>
      </div>

      {/* Muscle group filter */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none border-b border-zinc-800">
        <button
          onClick={() => setSelectedGroup(null)}
          className={cn(
            'shrink-0 px-3 h-8 rounded-full text-sm font-medium transition-all',
            !selectedGroup ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300'
          )}
        >
          Tümü
        </button>
        {muscleGroups.map(mg => (
          <button
            key={mg.id}
            onClick={() => setSelectedGroup(mg.id === selectedGroup ? null : mg.id)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-3 h-8 rounded-full text-sm font-medium transition-all',
              selectedGroup === mg.id ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300'
            )}
          >
            <span>{mg.icon}</span>
            <span>{mg.name}</span>
          </button>
        ))}
      </div>

      {/* Grid list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-zinc-500">Yükleniyor…</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-zinc-500">Egzersiz bulunamadı</div>
        ) : (
          <div className="space-y-5">
            {recentExercises.length > 0 && (
              <Section icon={<Clock size={12} />} label="Son Kullanılan" exercises={recentExercises} onSelect={onSelect} />
            )}
            {favorites.length > 0 && (
              <Section icon={<Star size={12} />} label="Favoriler" exercises={favorites} onSelect={onSelect} />
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
      <p className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider px-1 pb-2">
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
      className="relative flex flex-col items-start gap-1.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 active:scale-[0.97] transition-all text-left min-h-[88px]"
    >
      {exercise.is_favorite && (
        <Star size={12} className="absolute top-2 right-2 text-amber-400" fill="currentColor" />
      )}
      <span className="text-2xl">{exercise.icon}</span>
      <span className="text-white text-sm font-medium leading-tight line-clamp-2">
        {exercise.name}
      </span>
      {mg && (
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider mt-auto">
          {mg.name} · {exercise.equipment}
        </span>
      )}
    </button>
  )
}
