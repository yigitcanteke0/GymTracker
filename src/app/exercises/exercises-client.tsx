'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Star, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Exercise, MuscleGroup } from '@/types'
import { cn } from '@/lib/utils'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Chip } from '@/components/ui/chip'
import { GlyphTile } from '@/components/glyphs/glyph'
import { exerciseGlyph } from '@/lib/glyph-map'
import { AddExerciseModal } from './add-exercise-modal'

interface ExercisesClientProps {
  initialExercises: Exercise[]
  muscleGroups: MuscleGroup[]
}

export function ExercisesClient({
  initialExercises,
  muscleGroups,
}: ExercisesClientProps) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const toggleFavorite = useCallback(
    async (exercise: Exercise) => {
      await supabase
        .from('exercises')
        .update({ is_favorite: !exercise.is_favorite })
        .eq('id', exercise.id)
      setExercises(prev =>
        prev.map(e =>
          e.id === exercise.id ? { ...e, is_favorite: !e.is_favorite } : e
        )
      )
    },
    [supabase]
  )

  const filtered = exercises.filter(e => {
    const matchesQuery = e.name.toLowerCase().includes(query.toLowerCase())
    const matchesGroup = !selectedGroup || e.muscle_group_id === selectedGroup
    return matchesQuery && matchesGroup
  })

  const favs = filtered.filter(e => e.is_favorite)
  const rest = filtered.filter(e => !e.is_favorite)

  return (
    <div className="min-h-screen bg-bg flex flex-col pb-32">
      {/* Header */}
      <div className="sticky top-0 z-[8] px-3.5 pt-2.5 pb-3 bg-gradient-to-b from-bg via-bg/95 to-transparent">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            aria-label="Geri"
            className="w-9 h-9 rounded-xl bg-surface-2 text-fg-secondary shadow-[inset_0_0_0_0.5px_var(--color-border)] flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="flex-1 text-fg font-semibold text-[17px] tracking-[-0.01em]">
            Egzersizler
          </h1>
          <button
            onClick={() => setShowAdd(true)}
            aria-label="Egzersiz ekle"
            className="w-9 h-9 rounded-xl bg-accent-600 text-white shadow-[0_4px_12px_-4px_var(--color-accent-950)] flex items-center justify-center"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="px-3.5 flex flex-col gap-2.5">
        {/* Search */}
        <div className="h-11 rounded-[14px] bg-surface-2 shadow-[inset_0_0_0_0.5px_var(--color-border)] flex items-center px-3 gap-2">
          <Search size={16} className="text-fg-tertiary shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Egzersiz ara..."
            className="flex-1 bg-transparent text-fg outline-none text-[14px] font-medium tracking-[-0.005em] placeholder:text-fg-tertiary"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Temizle"
              className="text-fg-tertiary"
            >
              ×
            </button>
          )}
        </div>

        {/* Muscle chips */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
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

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-fg-tertiary">
            <Search size={28} className="text-fg-quaternary" />
            <p className="text-sm">Sonuç bulunamadı</p>
          </div>
        ) : (
          <>
            {favs.length > 0 && (
              <>
                <div className="px-1 pt-2 pb-1 flex items-center gap-1.5">
                  <Star size={12} fill="#f59e0b" className="text-amber-500" />
                  <Eyebrow>Favoriler</Eyebrow>
                </div>
                <div className="flex flex-col gap-2">
                  {favs.map(ex => (
                    <ExerciseRow
                      key={ex.id}
                      exercise={ex}
                      onToggleFav={() => toggleFavorite(ex)}
                    />
                  ))}
                </div>
              </>
            )}

            <div className={cn('px-1 pb-1', favs.length > 0 ? 'pt-3' : 'pt-2')}>
              <Eyebrow>Tüm Egzersizler</Eyebrow>
            </div>
            <div className="flex flex-col gap-2">
              {rest.map(ex => (
                <ExerciseRow
                  key={ex.id}
                  exercise={ex}
                  onToggleFav={() => toggleFavorite(ex)}
                />
              ))}
            </div>
          </>
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

function ExerciseRow({
  exercise,
  onToggleFav,
}: {
  exercise: Exercise
  onToggleFav: () => void
}) {
  const mg = exercise.muscle_group as MuscleGroup | undefined
  const glyph = exerciseGlyph(exercise.name, exercise.equipment)

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-[14px] bg-surface shadow-[inset_0_0_0_0.5px_var(--color-border)]"
    >
      <GlyphTile name={glyph} size={44} />
      <div className="flex-1 min-w-0">
        <div className="text-[14.5px] font-semibold text-fg tracking-[-0.01em] truncate">
          {exercise.name}
        </div>
        <div className="text-[11.5px] text-fg-tertiary mt-px">
          {mg?.name ?? '—'} · {exercise.equipment}
          {exercise.user_id === null && (
            <span className="ml-1 text-fg-quaternary">· sistem</span>
          )}
        </div>
      </div>
      <button
        onClick={onToggleFav}
        aria-label={exercise.is_favorite ? 'Favoriden çıkar' : 'Favoriye ekle'}
        className={cn(
          'w-9 h-9 rounded-[10px] flex items-center justify-center transition-colors',
          exercise.is_favorite
            ? 'text-amber-500'
            : 'text-fg-quaternary hover:text-fg-tertiary'
        )}
      >
        <Star
          size={18}
          fill={exercise.is_favorite ? 'currentColor' : 'none'}
          strokeWidth={1.8}
        />
      </button>
    </div>
  )
}
