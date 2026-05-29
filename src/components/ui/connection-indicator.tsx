'use client'

import { WifiOff, RefreshCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useOnline } from '@/hooks/use-online'

/**
 * Global offline indicator. Shows a thin banner at the top when offline,
 * and a transient "Yeniden bağlandı" toast when connectivity returns
 * (useful confirmation when user has been offline for a while).
 */
export function ConnectionIndicator() {
  const online = useOnline()
  const [wasOffline, setWasOffline] = useState(false)
  const [showReconnect, setShowReconnect] = useState(false)

  useEffect(() => {
    if (!online) {
      setWasOffline(true)
      setShowReconnect(false)
      return
    }
    if (wasOffline) {
      setShowReconnect(true)
      const t = setTimeout(() => setShowReconnect(false), 2400)
      return () => clearTimeout(t)
    }
  }, [online, wasOffline])

  if (!online) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-600/95 text-white px-4 pb-1.5 pt-[calc(env(safe-area-inset-top,0px)+0.375rem)] text-[12px] font-semibold flex items-center justify-center gap-1.5 shadow-lg">
        <WifiOff size={13} strokeWidth={2.2} />
        <span>
          Bağlantı yok — değişiklikler bağlantı kurulunca senkronize olur
        </span>
      </div>
    )
  }

  if (showReconnect) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] bg-success/95 text-white px-4 pb-1.5 pt-[calc(env(safe-area-inset-top,0px)+0.375rem)] text-[12px] font-semibold flex items-center justify-center gap-1.5 shadow-lg animate-fade-up">
        <RefreshCcw size={13} strokeWidth={2.2} />
        <span>Yeniden bağlandı — senkronize ediliyor</span>
      </div>
    )
  }

  return null
}
