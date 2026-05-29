'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const HIDDEN_PATHS = ['/login', '/signup']

/**
 * Sağ-alt thumb-zone'da konumlanan geri butonu. Tüm sticky header'larda
 * eskiden sol-üstte duran geri/X butonlarının yerine geçer.
 *
 * Hidden when:
 *  - Kullanıcı login değilse
 *  - /login veya /signup'taysa
 *  - Dashboard'daysa (`/`) — gidilecek geri yer yok
 *  - /workout/active'teyse — orada özel "kapat-ve-yoksay" mantığı bizatihi
 *    sayfanın kendi X butonunda kalıyor
 */
export function FloatingBack() {
  const [authed, setAuthed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setAuthed(!!user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setAuthed(!!session?.user)
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!authed) return null
  if (pathname === '/') return null
  if (pathname === '/workout/active') return null
  if (HIDDEN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return null
  }

  const handleBack = () => {
    // Tarayıcı geçmişinde geri varsa dön; yoksa ana sayfaya
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <button
      onClick={handleBack}
      aria-label="Geri"
      className={cn(
        'fixed z-[50] w-14 h-14 rounded-full flex items-center justify-center',
        'bg-surface-elevated text-fg shadow-[0_8px_24px_rgb(0_0_0_/_0.5),inset_0_0_0_0.5px_var(--color-border)]',
        'transition-all duration-200 active:scale-[0.92]',
        // FAB sağ-alttaysa (right-4 = 16px, w-14 = 56px), bu onun hemen
        // soluna 12px boşlukla otursun: 16 + 56 + 12 = 84px = right-21
        'right-21',
        'bottom-[calc(env(safe-area-inset-bottom,0px)+1.75rem)]'
      )}
    >
      <ArrowLeft size={22} strokeWidth={2.5} />
    </button>
  )
}
