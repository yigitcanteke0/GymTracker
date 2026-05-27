'use client'

import { cn } from '@/lib/utils'

interface StepperProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  quickStep?: number
  unit?: string
  accent?: boolean
  /** Height of the row in px. Default 50. */
  h?: number
  className?: string
}

/**
 * Big +/− stepper with optional quick-step outsides. Matches the SetComposer spec.
 *
 * Layout:  [−q]? [−]   value unit   [+]   [+q]?
 */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  quickStep,
  unit,
  accent,
  h = 50,
  className,
}: StepperProps) {
  const apply = (n: number) => {
    const clamped = Math.max(min, Math.min(max, n))
    onChange(Math.round(clamped * 10) / 10)
  }

  const stepBtnBase =
    'shrink-0 rounded-xl bg-surface-3 shadow-[inset_0_0_0_0.5px_var(--color-border)] flex items-center justify-center font-semibold leading-none transition-transform active:scale-[0.94] select-none tnum'

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {quickStep !== undefined && (
        <button
          onClick={() => apply(value - quickStep)}
          style={{ width: 42, height: h }}
          className={cn(stepBtnBase, 'text-[12px] text-accent-400')}
        >
          −{quickStep}
        </button>
      )}
      <button
        onClick={() => apply(value - step)}
        style={{ width: 44, height: h }}
        className={cn(stepBtnBase, 'text-[22px] text-fg-secondary')}
      >
        −
      </button>

      <div
        style={{ height: h }}
        className="flex-1 min-w-0 rounded-xl bg-surface-3 shadow-[inset_0_0_0_0.5px_var(--color-border)] flex items-center justify-center px-2 relative"
      >
        <div className="inline-flex items-baseline gap-1 leading-none">
          <span
            style={{ fontSize: h >= 54 ? 28 : 24, lineHeight: 1 }}
            className={cn(
              'font-semibold tracking-[-0.02em] tnum',
              accent ? 'text-accent-300' : 'text-fg'
            )}
          >
            {value}
          </span>
          {unit && (
            <span
              style={{ lineHeight: 1 }}
              className="text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-tertiary"
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => apply(value + step)}
        style={{ width: 44, height: h }}
        className={cn(stepBtnBase, 'text-[22px] text-fg-secondary')}
      >
        +
      </button>
      {quickStep !== undefined && (
        <button
          onClick={() => apply(value + quickStep)}
          style={{ width: 42, height: h }}
          className={cn(stepBtnBase, 'text-[12px] text-accent-400')}
        >
          +{quickStep}
        </button>
      )}
    </div>
  )
}
