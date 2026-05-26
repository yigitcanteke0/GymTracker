'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, Star } from 'lucide-react'
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
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [{ data: ex }, { data: mg }] = await Promise.all([
      supabase
        .from('exercises')
        .select('*, muscle_group:muscle_groups(*)')
        .order('is_favorite', { ascending: false })
        .order('name'),
      supabase.from('muscle_groups').select('*').order('name'),
    ])
    setExercises(ex ?? [])
    setMuscleGroups(mg ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = exercises.filter(e => {
    const matchesQuery = e.name.toLowerCase().includes(query.toLowerCase())
    const matchesGroup = !selectedGroup || e.muscle_group_id === selectedGroup
    return matchesQuery && matchesGroup
  })

  const favorites = filtered.filter(e => e.is_favorite)
  const rest = filtered.filter(e => !e.is_favorite)

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

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-zinc-500">Yükleniyor…</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-zinc-500">Egzersiz bulunamadı</div>
        ) : (
          <div className="p-4 space-y-1">
            {favorites.length > 0 && (
              <>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-2 pb-1">
                  Favoriler
                </p>
                {favorites.map(e => (
                  <ExerciseRow key={e.id} exercise={e} onSelect={onSelect} />
                ))}
                <div className="h-px bg-zinc-800 my-2" />
              </>
            )}
            {rest.map(e => (
              <ExerciseRow key={e.id} exercise={e} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ExerciseRow({
  exercise,
  onSelect,
}: {
  exercise: Exercise
  onSelect: (e: Exercise) => void
}) {
  return (
    <button
      onClick={() => onSelect(exercise)}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-800 active:bg-zinc-700 transition-all text-left"
    >
      <span className="text-2xl">{exercise.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{exercise.name}</p>
        {exercise.muscle_group && (
          <p className="text-xs text-zinc-500">
            {exercise.muscle_group.icon} {exercise.muscle_group.name} · {exercise.equipment}
          </p>
        )}
      </div>
      {exercise.is_favorite && <Star size={14} className="text-amber-400 shrink-0" />}
    </button>
  )
}
