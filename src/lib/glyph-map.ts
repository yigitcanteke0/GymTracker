import type {
  ExerciseGlyphName,
  MuscleGlyphName,
} from '@/components/glyphs/glyph'

/**
 * Map a Turkish/English exercise name → glyph key.
 * Order matters: more specific matches first.
 */
export function exerciseGlyph(
  name: string,
  equipment?: string | null
): ExerciseGlyphName {
  const n = name.toLowerCase()
  const eq = (equipment ?? '').toLowerCase()

  // Triceps
  if (n.includes('tricep') || n.includes('skull') || n.includes('pushdown') || n.includes('kickback')) return 'tricep'
  // Hammer curl specifically before plain curl
  if (n.includes('hammer')) return 'hammer'
  // Curls
  if (n.includes('curl')) return 'curl'
  // Deadlift family
  if (n.includes('deadlift') || n === 'dl' || n.includes('romanian')) return 'dl'
  // Bench variants
  if (n.includes('incline')) return 'incline'
  if (n.includes('decline') || n.includes('bench') || (n.includes('press') && eq === 'barbell' && n.includes('flat'))) return 'bench'
  if (n.includes('flat') && n.includes('press')) return 'bench'
  if (n.includes('db') && n.includes('press') && !n.includes('shoulder')) return 'incline'
  if (n.includes('dip')) return 'bench'
  // Chest fly / pec
  if (n.includes('fly') || n.includes('pec') || n.includes('cable fly')) return 'cablefly'
  // Pull-up
  if (n.includes('pull-up') || n.includes('pullup') || n.includes('pull up') || n.includes('barfiks') || n.includes('chin')) return 'pullup'
  // Lat pulldown
  if (n.includes('lat') && n.includes('pull')) return 'latpull'
  if (n.includes('pulldown')) return 'latpull'
  // Rows
  if (n.includes('row') || n.includes('face pull')) return n.includes('face pull') ? 'rear' : 'row'
  // Shoulder press / OHP
  if (n.includes('ohp') || n.includes('overhead') || n.includes('shoulder press') || n.includes('arnold')) return 'ohp'
  // Lateral raise
  if (n.includes('lateral') || n.includes('yan kald')) return 'lateral'
  // Rear delt
  if (n.includes('rear') || n.includes('arka')) return 'rear'
  // Legs
  if (n.includes('squat')) return n.includes('hack') ? 'legpress' : 'squat'
  if (n.includes('leg press')) return 'legpress'
  if (n.includes('leg curl') || n.includes('leg extension') || n.includes('lunge') || n.includes('calf')) return 'legpress'
  // Core
  if (n.includes('plank')) return 'plank'
  if (n.includes('crunch') || n.includes('sit-up') || n.includes('situp')) return 'crunch'

  // Default fallback by equipment
  if (eq === 'dumbbell') return 'incline'
  if (eq === 'cable') return 'cablefly'
  if (eq === 'machine') return 'legpress'
  if (eq === 'bodyweight') return 'pullup'

  return 'bench'
}

/**
 * Map a muscle group name → glyph key.
 */
export function muscleGlyph(name?: string | null): MuscleGlyphName {
  const n = (name ?? '').toLowerCase()
  if (n.includes('göğüs') || n.includes('gogus') || n.includes('chest')) return 'chest'
  if (n.includes('sırt') || n.includes('sirt') || n.includes('back')) return 'back'
  if (n.includes('omuz') || n.includes('shoulder') || n.includes('delt')) return 'shoulder'
  if (n.includes('bacak') || n.includes('leg') || n.includes('kalça') || n.includes('quad') || n.includes('hamstring') || n.includes('calf')) return 'leg'
  if (n.includes('biceps') || n.includes('triceps') || n.includes('kol') || n.includes('arm')) return 'arm'
  if (n.includes('karın') || n.includes('karin') || n.includes('core') || n.includes('ab')) return 'core'
  return 'arm'
}

/**
 * Best-effort: from a workout name, pick a representative muscle glyph.
 * Used for HistoryRow / Dashboard recent rows.
 */
export function workoutMuscleGlyph(name: string | null | undefined): MuscleGlyphName {
  const n = (name ?? '').toLowerCase()
  if (n.includes('push') || n.includes('göğüs') || n.includes('gogus') || n.includes('chest')) return 'chest'
  if (n.includes('pull') || n.includes('sırt') || n.includes('sirt') || n.includes('back')) return 'back'
  if (n.includes('leg') || n.includes('bacak')) return 'leg'
  if (n.includes('kol') || n.includes('arm') || n.includes('biceps') || n.includes('triceps')) return 'arm'
  if (n.includes('omuz') || n.includes('shoulder')) return 'shoulder'
  if (n.includes('karın') || n.includes('karin') || n.includes('core') || n.includes('ab')) return 'core'
  return 'chest'
}
