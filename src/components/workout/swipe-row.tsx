'use client'

import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SwipeRowProps {
  children: React.ReactNode
  onDelete: () => void
  /** Açıkken görünen kırmızı alanın genişliği (px). */
  revealWidth?: number
  className?: string
}

/**
 * Sağa kaydırınca sol kenardan kırmızı çöp kovası ortaya çıkar.
 * Sola geri kaydırınca veya gövdeye dokununca kapanır.
 * Çöp kovasına bir kere dokunmak `onDelete`'i tetikler.
 *
 * Dikey scroll kazanır (touch-action: pan-y): kullanıcı yukarı/aşağı
 * scroll ederken yanlışlıkla yatay drag tetiklenmez.
 */
export function SwipeRow({
  children,
  onDelete,
  revealWidth = 96,
  className,
}: SwipeRowProps) {
  const [offset, setOffset] = useState(0)
  const [opened, setOpened] = useState(false)
  const [animating, setAnimating] = useState(false)
  const dragging = useRef(false)
  const lockedH = useRef(false)
  const moved = useRef(false)
  const startX = useRef(0)
  const startY = useRef(0)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    dragging.current = true
    moved.current = false
    lockedH.current = false
    startX.current = e.clientX
    startY.current = e.clientY
    setAnimating(false)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current

    if (!lockedH.current) {
      // Dead zone: az hareket tetiklemez
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      // Dikey hareket daha baskın → drag'i iptal et (scroll kazansın)
      if (Math.abs(dy) > Math.abs(dx)) {
        dragging.current = false
        return
      }
      lockedH.current = true
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
    }

    moved.current = true
    const base = opened ? revealWidth : 0
    const next = Math.max(0, Math.min(revealWidth * 1.4, base + dx))
    setOffset(next)
  }

  const finish = () => {
    if (!dragging.current) return
    dragging.current = false
    setAnimating(true)
    if (!lockedH.current) return

    if (offset > revealWidth * 0.5) {
      setOffset(revealWidth)
      setOpened(true)
    } else {
      setOffset(0)
      setOpened(false)
    }
  }

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    // Drag oldu → tıklamayı yutup içeri (Link vb.) ulaşmasını engelle
    if (moved.current) {
      e.preventDefault()
      e.stopPropagation()
      moved.current = false
      return
    }
    // Açıkken gövdeye tıklamak → kapat, navigasyona izin verme
    if (opened) {
      e.preventDefault()
      e.stopPropagation()
      setAnimating(true)
      setOffset(0)
      setOpened(false)
    }
  }

  const revealOpacity = Math.min(1, offset / (revealWidth * 0.6))
  const iconScale = 0.85 + Math.min(0.15, offset / (revealWidth * 4))

  return (
    <div className={cn('relative overflow-hidden rounded-[18px]', className)}>
      {/* Sol kenardan açılan kırmızı sil alanı */}
      <button
        type="button"
        onClick={() => {
          // Hızlı kapanış görseli — parent zaten satırı kaldıracak
          setOpened(false)
          setOffset(0)
          onDelete()
        }}
        aria-label="Antrenmanı sil"
        className="absolute inset-y-0 left-0 flex items-center justify-center bg-red-600 text-white"
        style={{ width: revealWidth, opacity: revealOpacity }}
      >
        <Trash2
          size={20}
          strokeWidth={2.2}
          style={{ transform: `scale(${iconScale})` }}
        />
      </button>

      {/* Asıl satır */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        onClickCapture={onClickCapture}
        className="relative bg-bg rounded-[18px]"
        style={{
          transform: `translate3d(${offset}px, 0, 0)`,
          transition: animating
            ? 'transform 220ms cubic-bezier(.2,.7,.3,1)'
            : 'none',
          touchAction: 'pan-y',
        }}
      >
        {children}
      </div>
    </div>
  )
}
