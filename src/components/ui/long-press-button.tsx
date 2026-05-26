'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LongPressButtonProps {
  onComplete: () => void
  duration?: number
  className?: string
  children: React.ReactNode
  holdingLabel?: string
  disabled?: boolean
}

export function LongPressButton({
  onComplete,
  duration = 1200,
  className,
  children,
  holdingLabel = 'Bitirmek için basılı tut',
  disabled = false,
}: LongPressButtonProps) {
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const startRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const completedRef = useRef(false)

  const cancel = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setHolding(false)
    setProgress(0)
    completedRef.current = false
  }, [])

  const start = useCallback(() => {
    if (disabled) return
    setHolding(true)
    startRef.current = Date.now()
    completedRef.current = false

    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min(100, (elapsed / duration) * 100)
      setProgress(pct)
      if (pct >= 100) {
        if (!completedRef.current) {
          completedRef.current = true
          // Haptic
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate?.(50)
          }
          onComplete()
        }
        cancel()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [duration, onComplete, cancel, disabled])

  useEffect(() => () => cancel(), [cancel])

  return (
    <button
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      disabled={disabled}
      className={cn(
        'relative overflow-hidden select-none transition-all active:scale-[0.98] disabled:opacity-40',
        className
      )}
    >
      {/* Fill progress */}
      <div
        className="absolute inset-y-0 left-0 bg-emerald-500/40 transition-none"
        style={{ width: `${progress}%` }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {holding ? `${holdingLabel} (${Math.round(progress)}%)` : children}
      </span>
    </button>
  )
}
