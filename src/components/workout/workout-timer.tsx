'use client'

import { useState, useEffect } from 'react'
import { formatDuration } from '@/lib/utils'

interface WorkoutTimerProps {
  startedAt: string
}

export function WorkoutTimer({ startedAt }: WorkoutTimerProps) {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="font-mono text-zinc-300 tabular-nums text-sm">
      ⏱ {formatDuration(startedAt)}
    </span>
  )
}
