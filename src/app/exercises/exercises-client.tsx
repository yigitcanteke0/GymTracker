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
    <div className="min-h-screen bg-stone-950 pb-32">
      <div className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-md border-b border-stone-900">
        <div className="flex items-center gap-2.5 px-4 py-3">
          <Link
            href="/"
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-stone-900 text-stone-400 border border-stone-800/80 hover:bg-stone-800 hover:text-stone-200 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="flex-1 text-stone-50 font-semibold text-[15px] tracking-tight">
            Egzersiz Kütüphanesi
          </h1>
          <button
            onClick={() => setShowAdd(true)}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-accent-600 hover:bg-accent-500 text-white transition-colors shadow-sm shadow-accent-950/40"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2.5 bg-stone-900 rounded-xl px-3.5 h-10 border border-stone-800/80">
            <Search size={14} className="text-stone-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Egzersiz ara"
              className="flex-1 bg-transparent text-stone-100 placeholder-stone-600 outline-none text-[14px]"
            />
          </div>
        </div>
        <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedGroup(null)}
            className={cn(
              'shrink-0 px-3 h-7 rounded-full text-[12px] font-medium transition-all',
              !selectedGroup
                ? 'bg-stone-100 text-stone-900'
                : 'bg-stone-900 text-stone-400 border border-stone-800/80'
            )}
          >
            Tümü
          </button>
          {muscleGroups.map(mg => (
            <button
              key={mg.id}
              onClick={() => setSelectedGroup(mg.id === selectedGroup ? null : mg.id)}
              className={cn(
                'shrink-0 flex items-center gap-1 px-3 h-7 rounded-full text-[12px] font-medium transition-all',
                selectedGroup === mg.id
                  ? 'bg-stone-100 text-stone-900'
                  : 'bg-stone-900 text-stone-400 border border-stone-800/80'
              )}
            >
              {mg.icon} {mg.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Search size={24} className="text-stone-700" />
            <p className="text-stone-500 text-sm">Sonuç bulunamadı</p>
          </div>
        ) : (
          filtered.map(exercise => (
            <div
              key={exercise.id}
              className="group flex items-center gap-3 bg-stone-900/60 rounded-xl px-3.5 py-3 border border-stone-800/80 hover:border-stone-700 transition-colors"
            >
              <span className="text-xl shrink-0">{exercise.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-stone-50 font-medium text-[14px] truncate">
                  {exercise.name}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {(exercise.muscle_group as MuscleGroup | undefined)?.name} ·{' '}
                  <span className="text-stone-600">{exercise.equipment}</span>
                  {exercise.user_id === null && (
                    <span className="ml-1 text-stone-700">· sistem</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => toggleFavorite(exercise)}
                className={cn(
                  'h-9 w-9 flex items-center justify-center rounded-lg transition-colors',
                  exercise.is_favorite
                    ? 'text-amber-400'
                    : 'text-stone-700 hover:text-stone-400'
                )}
              >
                <Star
                  size={14}
                  fill={exercise.is_favorite ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
              </button>
            </div>
          ))
        )}
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
