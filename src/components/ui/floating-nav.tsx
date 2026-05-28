'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, History, Dumbbell, Plus, LogOut, User, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const HIDDEN_PATHS = ['/login', '/signup', '/workout/active']

export function FloatingNav() {
  const [open, setOpen] = useState(false)
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

  useEffect(() => {
    if (!authed) return
    router.prefetch('/')
    router.prefetch('/workout/active')
    router.prefetch('/history')
    router.prefetch('/exercises')
    router.prefetch('/profile')
  }, [authed, router])

  if (!authed) return null
  if (HIDDEN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) return null

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Sıralama yukarıdan aşağıya — dashboard FAB'a en yakın olsun
  const items: { href: string; icon: React.ReactNode; label: string; id: string }[] = [
    { id: 'profile', href: '/profile', icon: <User size={20} />, label: 'Profil' },
    {
      id: 'exercises',
      href: '/exercises',
      icon: <Dumbbell size={20} />,
      label: 'Egzersizler',
    },
    { id: 'history', href: '/history', icon: <History size={20} />, label: 'Geçmiş' },
    {
      id: 'active',
      href: '/workout/active',
      icon: <Plus size={20} strokeWidth={2.5} />,
      label: 'Yeni Antrenman',
    },
    { id: 'dashboard', href: '/', icon: <Home size={20} />, label: 'Ana Sayfa' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[40] bg-black/40 backdrop-blur-sm animate-fade-in"
        />
      )}

      <div
        className={cn(
          'fixed bottom-7 right-4 z-[50] flex flex-col items-end gap-2.5'
        )}
      >
        {/* Pill menu */}
        {open && (
          <div className="flex flex-col items-end gap-2 animate-fade-up">
            <button
              onClick={() => {
                setOpen(false)
                handleLogout()
              }}
              className="h-[46px] pl-1.5 pr-4 rounded-full inline-flex items-center gap-2.5 text-[13.5px] font-semibold tracking-[-0.005em] bg-surface-elevated text-fg-secondary hover:text-danger shadow-[0_8px_24px_rgb(0_0_0_/_0.5),inset_0_0_0_0.5px_var(--color-border)] transition-all active:scale-[0.96]"
            >
              <div className="w-9 h-9 rounded-full bg-surface-3 flex items-center justify-center">
                <LogOut size={20} />
              </div>
              Çıkış
            </button>
            {items.map(item => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'h-[46px] pl-1.5 pr-4 rounded-full inline-flex items-center gap-2.5 text-[13.5px] font-semibold tracking-[-0.005em] transition-all active:scale-[0.96]',
                    active
                      ? 'bg-accent-600 text-white shadow-[0_8px_24px_-4px_var(--color-accent-950),inset_0_0_0_0.5px_rgb(255_255_255_/_0.1)]'
                      : 'bg-surface-elevated text-fg shadow-[0_8px_24px_rgb(0_0_0_/_0.5),inset_0_0_0_0.5px_var(--color-border)]'
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center',
                      active
                        ? 'bg-black/15 text-white'
                        : 'bg-surface-3 text-fg-secondary'
                    )}
                  >
                    {item.icon}
                  </div>
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
          className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ease-[cubic-bezier(.3,.7,.4,1)] active:scale-[0.92]',
            open
              ? 'bg-surface-elevated text-fg shadow-[0_8px_24px_rgb(0_0_0_/_0.5),inset_0_0_0_0.5px_var(--color-border)]'
              : 'bg-[linear-gradient(180deg,var(--color-accent-500),var(--color-accent-700))] text-white shadow-[0_8px_24px_-4px_var(--color-accent-950),inset_0_1px_0_rgb(255_255_255_/_0.18)]'
          )}
        >
          {open ? (
            <X size={22} strokeWidth={2.5} />
          ) : (
            <Menu size={22} strokeWidth={2.5} />
          )}
        </button>
      </div>
    </>
  )
}
