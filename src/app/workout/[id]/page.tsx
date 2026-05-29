import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'
import type { WorkoutExerciseGroup, WorkoutSet, MuscleGroup } from '@/types'
import { WorkoutExportButton } from './export-button'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/ui/eyebrow'
import { BigNum } from '@/components/ui/big-num'
import { GlyphTile } from '@/components/glyphs/glyph'
import { exerciseGlyph } from '@/lib/glyph-map'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

const RIR_COLORS = ['#dc2626', '#ea580c', '#d97706', '#a3a341', '#65a342', '#16a34a']
const rirColor = (r: number | null) => RIR_COLORS[r ?? 3] ?? '#65a342'

export default async function WorkoutDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Paralel fetch — workout meta + sets aynı round-trip'te
  const [workoutResult, setsResult] = await Promise.all([
    supabase.from('workouts').select('*').eq('id', id).single(),
    supabase
      .from('workout_sets')
      .select('*, exercise:exercises(*, muscle_group:muscle_groups(*))')
      .eq('workout_id', id)
      .order('exercise_order')
      .order('set_number'),
  ])

  const workout = workoutResult.data
  if (workoutResult.error || !workout) notFound()

  const sets = setsResult.data

  const groups: WorkoutExerciseGroup[] = []
  for (const set of sets ?? []) {
    const existing = groups.find(g => g.exercise_order === set.exercise_order)
    if (existing) {
      existing.sets.push(set as WorkoutSet)
    } else {
      groups.push({
        exercise: (set as WorkoutSet).exercise!,
        exercise_order: set.exercise_order,
        sets: [set as WorkoutSet],
      })
    }
  }

  const totalVolume = (sets ?? []).reduce(
    (acc, s) => acc + Number(s.weight_kg) * (s.reps ?? 0),
    0
  )

  return (
    <div className="min-h-screen bg-bg flex flex-col pb-32">
      {/* Header */}
      <div className="sticky top-0 z-[8] px-3.5 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.625rem)] bg-gradient-to-b from-bg via-bg/95 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="flex-1 min-w-0">
            <Eyebrow>Antrenman</Eyebrow>
            <h1 className="text-fg font-semibold text-[16px] tracking-[-0.01em] truncate">
              {workout.name ?? 'Antrenman'}
            </h1>
          </div>
          <Link
            href={`/workout/${id}/edit`}
            aria-label="Düzenle"
            className="w-9 h-9 rounded-xl bg-surface-2 text-fg-secondary shadow-[inset_0_0_0_0.5px_var(--color-border)] flex items-center justify-center"
          >
            <Pencil size={15} />
          </Link>
          <WorkoutExportButton workoutId={id} workoutName={workout.name} />
        </div>
      </div>

      <div className="flex-1 px-3.5 flex flex-col">
        {/* Date subline */}
        <div className="text-[12px] text-fg-tertiary mb-3 px-1 tracking-[-0.005em] tnum">
          {formatDate(workout.started_at)}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          <Card padding={12} className="flex flex-col gap-1">
            <Eyebrow>Süre</Eyebrow>
            <BigNum
              value={formatDuration(workout.started_at, workout.finished_at)}
              size={24}
            />
          </Card>
          <Card padding={12} className="flex flex-col gap-1">
            <Eyebrow>Egzersiz</Eyebrow>
            <BigNum value={groups.length} size={24} />
          </Card>
          <Card padding={12} className="flex flex-col gap-1">
            <Eyebrow>Hacim</Eyebrow>
            <BigNum
              value={(totalVolume / 1000).toFixed(1)}
              unit="t"
              size={24}
            />
          </Card>
        </div>

        {/* Per-exercise detail blocks */}
        <div className="flex flex-col gap-2.5">
          {groups.map(group => (
            <DetailBlock key={group.exercise_order} group={group} />
          ))}
        </div>
      </div>
    </div>
  )
}

function DetailBlock({ group }: { group: WorkoutExerciseGroup }) {
  const mg = group.exercise.muscle_group as MuscleGroup | undefined
  const blockVol = group.sets.reduce(
    (a, s) => a + Number(s.weight_kg) * (s.reps ?? 0),
    0
  )
  const glyph = exerciseGlyph(group.exercise.name, group.exercise.equipment)

  return (
    <Card padding={14}>
      <div className="flex items-center gap-3 mb-3">
        <GlyphTile name={glyph} size={44} />
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-fg tracking-[-0.01em] truncate">
            {group.exercise.name}
          </div>
          <div className="text-[11.5px] text-fg-tertiary mt-px tnum">
            {mg?.name ?? ''} · {group.sets.length} set ·{' '}
            {blockVol.toLocaleString('tr-TR')}kg hacim
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        {group.sets.map((s, i) => (
          <div
            key={s.id}
            className="grid items-center gap-3 py-2"
            style={{
              gridTemplateColumns: '20px 1fr auto auto',
              borderTop: i === 0 ? 'none' : '0.5px solid var(--color-border)',
            }}
          >
            <div className="text-[10.5px] font-bold text-fg-quaternary tnum tracking-[0.04em]">
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="text-[14px] font-semibold text-fg tnum tracking-[-0.005em]">
              {s.weight_kg}
              <span className="text-[11px] text-fg-tertiary font-medium">kg</span>
              <span className="mx-1.5 text-fg-quaternary">×</span>
              {s.reps}
              <span className="text-[11px] text-fg-tertiary font-medium"> rep</span>
            </div>
            <SetTrack reps={s.reps ?? 0} />
            {s.rir !== null ? (
              <div
                style={{
                  background: `${rirColor(s.rir)}22`,
                  color: rirColor(s.rir),
                }}
                className="h-5 px-1.5 rounded-full inline-flex items-center text-[9.5px] font-bold tracking-[0.04em]"
              >
                R{s.rir}
              </div>
            ) : (
              <div />
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function SetTrack({ reps, max = 12 }: { reps: number; max?: number }) {
  return (
    <div className="flex items-center gap-[1.5px]">
      {Array.from({ length: max }).map((_, i) => {
        const active = i < reps
        return (
          <div
            key={i}
            style={{
              width: 3,
              height: active ? 14 : 6,
              opacity: active ? 1 - i * 0.04 : 1,
              background: active ? 'var(--color-accent-500)' : 'var(--color-surface-3)',
            }}
            className="rounded-[1px]"
          />
        )
      })}
    </div>
  )
}
