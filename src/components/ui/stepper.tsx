'use client'

import { useEffect, useRef, useState } from 'react'
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
 * Big +/− stepper with optional quick-step outsides. The middle value is
 * tap-to-edit — opens a numeric keyboard so the user can type arbitrary
 * values (e.g. 12 when step is 2.5).
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

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset draft when value changes externally (e.g. +/− buttons)
  useEffect(() => {
    if (!editing) setDraft(String(value))
  }, [value, editing])

  // Auto-focus + select all on enter edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commit = () => {
    const normalized = draft.replace(',', '.').trim()
    if (normalized === '') {
      setDraft(String(value))
    } else {
      const n = parseFloat(normalized)
      if (!isNaN(n)) {
        apply(n)
      } else {
        setDraft(String(value))
      }
    }
    setEditing(false)
  }

  const stepBtnBase =
    'shrink-0 rounded-xl bg-surface-3 shadow-[inset_0_0_0_0.5px_var(--color-border)] flex items-center justify-center font-semibold leading-none transition-transform active:scale-[0.94] select-none tnum'

  const fontSize = h >= 54 ? 28 : 24

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
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              enterKeyHint="done"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commit()
                } else if (e.key === 'Escape') {
                  setDraft(String(value))
                  setEditing(false)
                }
              }}
              style={{ fontSize, lineHeight: 1, width: '5ch' }}
              className={cn(
                'bg-transparent outline-none text-center font-semibold tracking-[-0.02em] tnum',
                accent ? 'text-accent-300' : 'text-fg'
              )}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              style={{ fontSize, lineHeight: 1 }}
              className={cn(
                'font-semibold tracking-[-0.02em] tnum',
                accent ? 'text-accent-300' : 'text-fg'
              )}
            >
              {value}
            </button>
          )}
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
