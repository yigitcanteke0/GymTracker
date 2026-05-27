'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'success' | 'danger'
type Size = 'lg' | 'xl'

interface LongPressButtonProps {
  onComplete: () => void
  duration?: number
  variant?: Variant
  size?: Size
  full?: boolean
  className?: string
  children: React.ReactNode
  disabled?: boolean
}

const VARIANTS: Record<Variant, { fill: string; stroke: string; text: string }> = {
  primary: {
    fill: 'var(--color-accent-600)',
    stroke: 'var(--color-accent-border)',
    text: 'var(--color-accent-300)',
  },
  success: {
    fill: 'var(--color-success)',
    stroke: 'rgb(40 180 120 / 0.3)',
    text: '#34d399',
  },
  danger: {
    fill: 'var(--color-danger)',
    stroke: 'rgb(220 80 80 / 0.3)',
    text: '#f87171',
  },
}

/**
 * Press-and-hold button. clip-path fills with variant color; on completion
 * vibrates and fires `onComplete`. Cancel on pointer leave/up resets with
 * a 0.25s clip-path ease-out.
 */
export function LongPressButton({
  onComplete,
  duration = 1200,
  variant = 'primary',
  size = 'lg',
  full = true,
  className,
  children,
  disabled = false,
}: LongPressButtonProps) {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef(0)
  const completedRef = useRef(false)
  const v = VARIANTS[variant]
  const h = size === 'lg' ? 52 : 60

  const cancel = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (!completedRef.current) setProgress(0)
  }, [])

  const start = useCallback(() => {
    if (disabled) return
    completedRef.current = false
    startRef.current = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - startRef.current) / duration)
      setProgress(p)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        completedRef.current = true
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.(30)
        }
        onComplete()
        setTimeout(() => setProgress(0), 200)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [duration, onComplete, disabled])

  useEffect(() => () => cancel(), [cancel])

  return (
    <button
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      disabled={disabled}
      style={{
        height: h,
        boxShadow: `inset 0 0 0 1px ${v.stroke}`,
        width: full ? '100%' : undefined,
      }}
      className={cn(
        'relative overflow-hidden bg-surface-2 rounded-[14px] px-5 select-none',
        'inline-flex items-center justify-center gap-2',
        'font-semibold text-[14px] tracking-[-0.005em]',
        'disabled:opacity-50 disabled:pointer-events-none',
        'transition-transform active:scale-[0.985]',
        className
      )}
    >
      <div
        aria-hidden
        style={{
          clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
          background: v.fill,
          transition: progress === 0 ? 'clip-path .25s ease-out' : 'none',
        }}
        className="absolute inset-0"
      />
      <span
        style={{ color: progress > 0.55 ? '#fff' : v.text, transition: 'color .1s' }}
        className="relative z-10 inline-flex items-center gap-2"
      >
        {children}
      </span>
    </button>
  )
}
