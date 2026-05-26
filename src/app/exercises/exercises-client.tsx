'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Star, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Exercise, MuscleGroup } from '@/types'
import { cn } from '@/lib/utils'
import { AddExerciseModal } from './add-exercise-modal'

interface ExercisesClientProps {
  initialExercises: Exercise[]
  muscleGroups: MuscleGroup[]
}

export function ExercisesClient({ initialExercises, muscleGroups }: ExercisesClientProps) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const toggleFavorite = useCallback(async (exercise: Exercise) => {
    await supabase
      .from('exercises')
      .update({ is_favorite: !exercise.is_favorite })
      .eq('id', exercise.id)
    setExercises(prev =>
      prev.map(e =>
        e.id === exercise.id ? { ...e, is_favorite: !e.is_favorite } : e
      )
    )
  }, [supabase])

  const filtered = exercises.filter(e => {
    const matchesQuery = e.name.toLowerCase().includes(query.toLowerCase())
    const matchesGroup = !selectedGroup || e.muscle_group_id === selectedGroup
    return matchesQuery && matchesGroup
  })

  return (
    <div className="min-h-screen bg-zinc-950 pb-8">
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="flex-1 text-white font-semibold text-base">Egzersiz Kütüphanesi</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-indigo-600 text-white"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 h-10">
            <Search size={16} className="text-zinc-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Egzersiz ara..."
              className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedGroup(null)}
            className={cn(
              'shrink-0 px-3 h-7 rounded-full text-xs font-medium',
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
                'shrink-0 flex items-center gap-1 px-3 h-7 rounded-full text-xs font-medium',
                selectedGroup === mg.id ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300'
              )}
            >
              {mg.icon} {mg.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-1">
        {filtered.map(exercise => (
          <div
            key={exercise.id}
            className="flex items-center gap-3 bg-zinc-900 rounded-xl px-3 py-3 border border-zinc-800"
          >
            <span className="text-2xl">{exercise.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{exercise.name}</p>
              <p className="text-xs text-zinc-500">
                {(exercise.muscle_group as MuscleGroup | undefined)?.name} · {exercise.equipment}
                {exercise.user_id === null && (
                  <span className="ml-1 text-zinc-600">· sistem</span>
                )}
              </p>
            </div>
            <button
              onClick={() => toggleFavorite(exercise)}
              className={cn(
                'h-9 w-9 flex items-center justify-center rounded-lg transition-all',
                exercise.is_favorite ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
              )}
            >
              <Star size={16} fill={exercise.is_favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        ))}
      </div>

      {showAdd && (
        <AddExerciseModal
          muscleGroups={muscleGroups}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
