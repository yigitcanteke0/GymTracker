'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Hash, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { withRetry, unwrap } from '@/lib/retry'
import type { Workout } from '@/types'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/ui/eyebrow'
import { GlyphTile } from '@/components/glyphs/glyph'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { workoutMuscleGlyph } from '@/lib/glyph-map'
import { formatShortDate, formatDuration } from '@/lib/utils'
import { SwipeRow } from './swipe-row'

export interface HistoryGroup {
  label: string
  items: Workout[]
}

interface HistoryListProps {
  groups: HistoryGroup[]
  countMap: Record<string, number>
  volumeMap: Record<string, number>
}

export function HistoryList({ groups, countMap, volumeMap }: HistoryListProps) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    // Optimistic: hide row immediately
    setHidden(prev => new Set(prev).add(id))
    try {
      await withRetry(() =>
        unwrap(
          supabase
            .from('workouts')
            .delete()
            .eq('id', id)
            .select()
            .maybeSingle()
        )
      )
      // ON DELETE CASCADE workout_sets'i de düşürür (şemada tanımlı)
      router.refresh()
    } catch {
      // Hata: restore
      setHidden(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  return (
    <>
      {groups.map(group => {
        const visibleItems = group.items.filter(w => !hidden.has(w.id))
        if (visibleItems.length === 0) return null
        return (
          <div key={group.label} className="mt-2">
            <div className="px-1 pb-2 flex items-baseline justify-between">
              <Eyebrow>{group.label}</Eyebrow>
              <span className="text-[11px] text-fg-quaternary font-semibold tnum">
                {visibleItems.length} antrenman
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {visibleItems.map(w => {
                const muscle = workoutMuscleGlyph(w.name)
                const volume = volumeMap[w.id] ?? 0
                return (
                  <SwipeRow key={w.id} onDelete={() => handleDelete(w.id)}>
                    <PrefetchLink href={`/workout/${w.id}`} className="block">
                      <Card
                        padding={12}
                        className="flex items-center gap-3"
                      >
                        <GlyphTile name={muscle} size={44} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[15px] font-semibold text-fg tracking-[-0.01em] truncate">
                            {w.name ?? 'Antrenman'}
                          </div>
                          <div className="text-[12px] text-fg-tertiary mt-0.5 flex items-center gap-1.5 tnum">
                            <span>{formatShortDate(w.started_at)}</span>
                            <span className="opacity-40">·</span>
                            <span className="inline-flex items-center gap-0.5">
                              <Clock size={10} className="opacity-60" />
                              {formatDuration(w.started_at, w.finished_at)}
                            </span>
                            <span className="opacity-40">·</span>
                            <span className="inline-flex items-center gap-0.5">
                              <Hash size={10} className="opacity-60" />
                              {countMap[w.id] ?? 0} set
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[14px] font-semibold text-fg-secondary tnum tracking-[-0.01em]">
                            {(volume / 1000).toFixed(1)}
                            <span className="text-[10.5px] text-fg-tertiary ml-0.5">
                              t
                            </span>
                          </div>
                          <ChevronRight
                            size={14}
                            className="text-fg-quaternary inline-block mt-0.5"
                          />
                        </div>
                      </Card>
                    </PrefetchLink>
                  </SwipeRow>
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}
