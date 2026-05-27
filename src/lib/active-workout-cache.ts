import type { ActiveExercise } from '@/types'

/**
 * localStorage-backed snapshot of the in-progress workout. Provides
 * crash recovery and offline durability:
 *
 * - Saved continuously (debounced) while user works
 * - Restored on mount if DB has nothing (e.g. user was offline and never
 *   managed to create the workout row)
 * - Cleared on explicit finish/discard
 *
 * Pending sets (completed locally but never synced) live here too —
 * identified by `completed: true && id: undefined`. The active workout
 * page flushes these on reconnect.
 */

const KEY = 'gymtracker.active-workout.v1'
const MAX_AGE_MS = 4 * 60 * 60 * 1000 // 4 hours — beyond auto-close window

export interface ActiveWorkoutSnapshot {
  /** May be null if user added local state but no DB row yet (offline). */
  workoutId: string | null
  workoutName: string
  startedAt: string
  exercises: ActiveExercise[]
  /** Timestamp when this snapshot was last written (ms epoch). */
  savedAt: number
  /** Auth user this snapshot belongs to — guard against cross-account replay. */
  userId: string | null
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

export function saveSnapshot(snap: ActiveWorkoutSnapshot): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(KEY, JSON.stringify(snap))
  } catch {
    // Quota full or storage disabled — ignore
  }
}

export function loadSnapshot(userId?: string | null): ActiveWorkoutSnapshot | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const snap = JSON.parse(raw) as ActiveWorkoutSnapshot
    if (!snap || typeof snap.savedAt !== 'number') return null
    if (Date.now() - snap.savedAt > MAX_AGE_MS) return null
    // Cross-account guard
    if (userId && snap.userId && snap.userId !== userId) return null
    return snap
  } catch {
    return null
  }
}

export function clearSnapshot(): void {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

/** True if the snapshot has any completed-but-unsynced sets. */
export function hasPendingSets(snap: ActiveWorkoutSnapshot | null): boolean {
  if (!snap) return false
  return snap.exercises.some(e => e.sets.some(s => s.completed && !s.id))
}
