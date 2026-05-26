'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, History, Dumbbell, Play, LogOut, Menu, X } from 'lucide-react'
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
  }, [authed, router])

  if (!authed) return null
  if (HIDDEN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) return null

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const items = [
    { href: '/', icon: Home, label: 'Ana Sayfa' },
    { href: '/workout/active', icon: Play, label: 'Yeni Antrenman', accent: true },
    { href: '/history', icon: History, label: 'Geçmiş' },
    { href: '/exercises', icon: Dumbbell, label: 'Egzersizler' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-stone-950/70 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setOpen(false)}
      />

      {/* Menu items */}
      <div
        className={cn(
          'fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 transition-all duration-200',
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-3 pointer-events-none'
        )}
      >
        {items.map((item, i) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${i * 25}ms` : '0ms' }}
              className={cn(
                'flex items-center gap-2.5 pl-3.5 pr-4 h-11 rounded-xl font-medium text-[14px] transition-all active:scale-[0.96] shadow-lg shadow-stone-950/60',
                item.accent
                  ? 'bg-accent-600 text-white border border-accent-500/40'
                  : active
                  ? 'bg-stone-100 text-stone-900'
                  : 'bg-stone-900 text-stone-200 border border-stone-800'
              )}
            >
              <Icon size={16} strokeWidth={2.2} />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => { setOpen(false); handleLogout() }}
          style={{ transitionDelay: open ? `${items.length * 25}ms` : '0ms' }}
          className="flex items-center gap-2.5 pl-3.5 pr-4 h-11 rounded-xl font-medium text-[14px] bg-stone-900 text-stone-400 border border-stone-800 hover:text-red-400 hover:border-red-900/60 shadow-lg shadow-stone-950/60 transition-all active:scale-[0.96]"
        >
          <LogOut size={16} strokeWidth={2.2} />
          <span>Çıkış</span>
        </button>
      </div>

      {/* FAB toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
        className={cn(
          'fixed bottom-5 right-4 z-50 h-14 w-14 rounded-full shadow-xl shadow-stone-950/70 flex items-center justify-center transition-all duration-200 active:scale-90',
          open
            ? 'bg-stone-100 text-stone-900 rotate-90'
            : 'bg-accent-600 text-white hover:bg-accent-500 border border-accent-500/30'
        )}
      >
        {open ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
      </button>
    </>
  )
}
