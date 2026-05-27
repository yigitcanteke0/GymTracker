import { cn } from '@/lib/utils'

export type ExerciseGlyphName =
  | 'bench'
  | 'incline'
  | 'cablefly'
  | 'pullup'
  | 'row'
  | 'latpull'
  | 'ohp'
  | 'lateral'
  | 'rear'
  | 'squat'
  | 'dl'
  | 'legpress'
  | 'curl'
  | 'tricep'
  | 'hammer'
  | 'plank'
  | 'crunch'

export type MuscleGlyphName = 'chest' | 'back' | 'shoulder' | 'leg' | 'arm' | 'core'

export type GlyphName = ExerciseGlyphName | MuscleGlyphName

interface GlyphProps {
  name: GlyphName
  size?: number
  className?: string
}

/**
 * 48×48 viewBox abstract SVG glyphs. Stroke uses currentColor; wrapper controls tint.
 */
export function Glyph({ name, size = 48, className }: GlyphProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 48 48',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  }

  switch (name) {
    // ─── Muscle group glyphs ───────────────────────────────────────
    case 'chest':
      return (
        <svg {...common}>
          <path d="M24 13c-3 0-5 1.5-7 3-3 2-5 5-5 9 0 4 2 6 5 6 3 0 5-2 7-5" />
          <path d="M24 13c3 0 5 1.5 7 3 3 2 5 5 5 9 0 4-2 6-5 6-3 0-5-2-7-5" />
          <circle cx="16" cy="20" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="32" cy="20" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'back':
      return (
        <svg {...common}>
          <path d="M14 13l10 6 10-6" />
          <path d="M16 21l8 4 8-4" />
          <path d="M19 29l5 3 5-3" />
          <path d="M24 19v18" />
        </svg>
      )
    case 'shoulder':
      return (
        <svg {...common}>
          <path d="M10 28c0-7 6-13 14-13s14 6 14 13" />
          <path d="M10 28h28" />
          <circle cx="14" cy="28" r="3" fill="currentColor" stroke="none" />
          <circle cx="34" cy="28" r="3" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'leg':
      return (
        <svg {...common}>
          <path d="M16 12v22a3 3 0 003 3h2a3 3 0 003-3V12" />
          <path d="M24 12v22a3 3 0 003 3h2a3 3 0 003-3V12" />
          <path d="M14 12h20" />
        </svg>
      )
    case 'arm':
      return (
        <svg {...common}>
          <path d="M12 36l8-10c2-3 4-4 8-4l8 2" />
          <circle cx="22" cy="22" r="4.5" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'core':
      return (
        <svg {...common}>
          <rect x="14" y="14" width="20" height="6" rx="2" />
          <rect x="14" y="22" width="20" height="6" rx="2" />
          <rect x="14" y="30" width="20" height="6" rx="2" />
          <path d="M24 14v22" strokeOpacity="0.4" />
        </svg>
      )

    // ─── Exercise glyphs ───────────────────────────────────────────
    case 'bench':
      return (
        <svg {...common}>
          <rect x="10" y="30" width="28" height="3" rx="1.5" fill="currentColor" stroke="none" opacity="0.4" />
          <path d="M24 30v-8" />
          <circle cx="24" cy="20" r="2.5" fill="currentColor" stroke="none" />
          <rect x="8" y="11" width="32" height="3" rx="1.5" fill="currentColor" stroke="none" />
          <circle cx="8" cy="12.5" r="3" fill="currentColor" stroke="none" />
          <circle cx="40" cy="12.5" r="3" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'incline':
      return (
        <svg {...common}>
          <path d="M10 38l24-22" strokeWidth="3" opacity="0.4" />
          <circle cx="13" cy="20" r="3.5" fill="currentColor" stroke="none" />
          <circle cx="35" cy="20" r="3.5" fill="currentColor" stroke="none" />
          <path d="M13 20v-6M35 20v-6" />
          <path d="M11 14h4M33 14h4" />
        </svg>
      )
    case 'cablefly':
      return (
        <svg {...common}>
          <path d="M10 12v8M38 12v8" />
          <path d="M10 20c4 4 10 8 14 8s10-4 14-8" />
          <circle cx="24" cy="28" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="10" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="38" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'pullup':
      return (
        <svg {...common}>
          <rect x="8" y="10" width="32" height="3" rx="1.5" fill="currentColor" stroke="none" />
          <path d="M18 13v6M30 13v6" />
          <circle cx="24" cy="24" r="4.5" />
          <path d="M24 28v8M20 36l4-4 4 4" />
        </svg>
      )
    case 'row':
      return (
        <svg {...common}>
          <circle cx="14" cy="24" r="4" fill="currentColor" stroke="none" />
          <path d="M18 24l8-4M18 24l8 4" />
          <rect x="26" y="14" width="3" height="20" rx="1" fill="currentColor" stroke="none" />
          <rect x="32" y="18" width="6" height="12" rx="1.5" fill="currentColor" stroke="none" opacity="0.55" />
        </svg>
      )
    case 'latpull':
      return (
        <svg {...common}>
          <rect x="10" y="10" width="28" height="3" rx="1.5" fill="currentColor" stroke="none" />
          <path d="M18 13l-2 8M30 13l2 8" />
          <circle cx="24" cy="28" r="4.5" />
          <path d="M16 21l8 5 8-5" />
        </svg>
      )
    case 'ohp':
      return (
        <svg {...common}>
          <rect x="8" y="10" width="32" height="3" rx="1.5" fill="currentColor" stroke="none" />
          <circle cx="8" cy="11.5" r="3" fill="currentColor" stroke="none" />
          <circle cx="40" cy="11.5" r="3" fill="currentColor" stroke="none" />
          <path d="M18 14v8M30 14v8" />
          <circle cx="24" cy="28" r="4" />
          <path d="M24 32v6" />
        </svg>
      )
    case 'lateral':
      return (
        <svg {...common}>
          <circle cx="24" cy="18" r="4" />
          <path d="M24 22v10" />
          <path d="M10 26l14-4 14 4" />
          <circle cx="10" cy="26" r="3" fill="currentColor" stroke="none" />
          <circle cx="38" cy="26" r="3" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'rear':
      return (
        <svg {...common}>
          <circle cx="24" cy="20" r="4" />
          <path d="M20 24c-4 2-8 0-10-4" />
          <path d="M28 24c4 2 8 0 10-4" />
          <circle cx="10" cy="20" r="2" fill="currentColor" stroke="none" />
          <circle cx="38" cy="20" r="2" fill="currentColor" stroke="none" />
          <path d="M24 24v10" />
        </svg>
      )
    case 'squat':
      return (
        <svg {...common}>
          <rect x="6" y="13" width="36" height="3" rx="1.5" fill="currentColor" stroke="none" />
          <circle cx="8" cy="14.5" r="3.5" fill="currentColor" stroke="none" />
          <circle cx="40" cy="14.5" r="3.5" fill="currentColor" stroke="none" />
          <circle cx="24" cy="22" r="3" />
          <path d="M22 25l-4 8 4 4M26 25l4 8-4 4" />
        </svg>
      )
    case 'dl':
      return (
        <svg {...common}>
          <path d="M6 36h36" opacity="0.4" />
          <rect x="6" y="30" width="36" height="3" rx="1.5" fill="currentColor" stroke="none" />
          <circle cx="8" cy="31.5" r="4" fill="currentColor" stroke="none" />
          <circle cx="40" cy="31.5" r="4" fill="currentColor" stroke="none" />
          <path d="M24 30v-8" />
          <circle cx="24" cy="18" r="4" />
        </svg>
      )
    case 'legpress':
      return (
        <svg {...common}>
          <rect x="6" y="32" width="36" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.4" />
          <path d="M8 32l20-16" />
          <rect x="24" y="12" width="14" height="8" rx="1.5" fill="currentColor" stroke="none" />
          <circle cx="16" cy="32" r="3" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'curl':
      return (
        <svg {...common}>
          <path d="M10 36c0-10 6-16 14-16s14 6 14 16" strokeWidth="2.5" />
          <rect x="6" y="34" width="14" height="3" rx="1.5" fill="currentColor" stroke="none" />
          <circle cx="6" cy="35.5" r="3" fill="currentColor" stroke="none" />
          <rect x="28" y="34" width="14" height="3" rx="1.5" fill="currentColor" stroke="none" />
          <circle cx="42" cy="35.5" r="3" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'tricep':
      return (
        <svg {...common}>
          <path d="M24 8v6" />
          <circle cx="24" cy="8" r="1.5" fill="currentColor" stroke="none" />
          <rect x="14" y="14" width="20" height="3" rx="1.5" fill="currentColor" stroke="none" />
          <path d="M18 17l-4 18M30 17l4 18" />
          <circle cx="14" cy="35" r="3" fill="currentColor" stroke="none" />
          <circle cx="34" cy="35" r="3" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'hammer':
      return (
        <svg {...common}>
          <rect x="20" y="6" width="8" height="36" rx="1.5" fill="currentColor" stroke="none" opacity="0.4" />
          <rect x="14" y="8" width="20" height="6" rx="1.5" fill="currentColor" stroke="none" />
          <rect x="14" y="34" width="20" height="6" rx="1.5" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'plank':
      return (
        <svg {...common}>
          <path d="M6 30h36" opacity="0.4" />
          <path d="M10 26h28" />
          <circle cx="38" cy="22" r="4" />
          <path d="M10 26l-2 6M14 26l-2 6M18 26l-2 6" />
          <path d="M22 26l-2 6M26 26l-2 6M30 26l-2 6" />
        </svg>
      )
    case 'crunch':
      return (
        <svg {...common}>
          <path d="M8 36c4-2 8-3 16-3s12 1 16 3" opacity="0.4" />
          <path d="M10 32c4-8 10-12 14-12" />
          <circle cx="22" cy="18" r="4" />
          <path d="M22 22l8 10" />
          <path d="M32 30l6 4" />
        </svg>
      )
    default:
      return null
  }
}

interface GlyphTileProps {
  name: GlyphName
  size?: number
  className?: string
  /** Override accent tint. Defaults to accent-300. */
  tint?: string
}

/**
 * Glyph centered on a tinted plate. Default 44×44, radius scales with size.
 */
export function GlyphTile({
  name,
  size = 44,
  className,
  tint,
}: GlyphTileProps) {
  const radius = size * 0.28
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        color: tint,
      }}
      className={cn(
        'relative shrink-0 bg-tile-bg flex items-center justify-center',
        'shadow-[inset_0_0_0_0.5px_var(--color-tile-border),inset_0_1px_0_rgb(255_255_255_/_0.05)]',
        !tint && 'text-accent-300',
        className
      )}
    >
      <Glyph name={name} size={Math.round(size * 0.7)} />
    </div>
  )
}
