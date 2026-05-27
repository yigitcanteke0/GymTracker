'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Timer, AlertCircle } from 'lucide-react'
import { ACTIVE_WORKOUT_MAX_MS } from '@/lib/active-workout'

interface ActiveWorkoutBannerProps {
  workoutId: string
  workoutName: string | null
  startedAt: string
  setCount: number
}

/**
 * Devam eden antrenmanı home page'te göster, sürekli güncellenen "kalan süre"
 * etiketiyle birlikte. Sistem 2 saatte otomatik kapatır.
 */
export function ActiveWorkoutBanner({
  workoutId,
  workoutName,
  startedAt,
  setCount,
}: ActiveWorkoutBannerProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const startedMs = new Date(startedAt).getTime()
  const elapsedMs = now - startedMs
  const remainingMs = Math.max(0, ACTIVE_WORKOUT_MAX_MS - elapsedMs)

  const elapsedMin = Math.floor(elapsedMs / 60_000)
  const elapsedH = Math.floor(elapsedMin / 60)
  const elapsedRemMin = elapsedMin % 60
  const elapsedLabel =
    elapsedH > 0
      ? `${elapsedH}sa ${elapsedRemMin}dk önce başladı`
      : `${elapsedMin} dk önce başladı`

  const remMin = Math.floor(remainingMs / 60_000)
  const remH = Math.floor(remMin / 60)
  const remRemMin = remMin % 60
  const remLabel =
    remH > 0 ? `${remH}sa ${remRemMin}dk sonra otomatik biter` : `${remMin}dk sonra otomatik biter`

  return (
    <Link
      href="/workout/active"
      prefetch
      className="relative overflow-hidden rounded-[18px] block transition-transform active:scale-[0.99]"
    >
      <div
        className="relative p-[18px] flex items-center gap-3.5 text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.18),0_8px_24px_-8px_var(--color-accent-950),0_1px_2px_rgb(0_0_0_/_0.4)]"
        style={{
          background:
            'linear-gradient(180deg, var(--color-accent-500), var(--color-accent-700))',
        }}
      >
        <div className="w-[50px] h-[50px] rounded-[14px] bg-black/20 flex items-center justify-center shadow-[inset_0_0_0_0.5px_rgb(255_255_255_/_0.15)] relative">
          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_rgb(255_255_255_/_0.7)] animate-pulse-dot" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/70">
            Devam Eden Antrenman
          </p>
          <div className="text-[18px] font-semibold tracking-[-0.015em] mt-0.5 truncate">
            {workoutName || 'Adsız Antrenman'}
          </div>
          <div className="text-[11.5px] text-white/75 mt-0.5 inline-flex items-center gap-1.5 tnum">
            <Timer size={11} className="opacity-80" />
            <span>{elapsedLabel}</span>
            <span className="opacity-50">·</span>
            <span>{setCount} set</span>
          </div>
        </div>
        <ChevronRight className="opacity-80 shrink-0" />
      </div>
      {/* Warning strip */}
      <div className="px-[18px] py-2 bg-accent-950 text-accent-300 text-[11px] font-medium flex items-center gap-1.5 tnum shadow-[inset_0_1px_0_rgb(0_0_0_/_0.2)]">
        <AlertCircle size={11} />
        <span>
          Yeni antrenman başlatmak için önce bunu bitir. {remLabel}.
        </span>
      </div>
    </Link>
  )
}
