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

  // Prefetch likely next routes
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
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setOpen(false)}
      />

      {/* Menu items */}
      <div
        className={cn(
          'fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2.5 transition-all duration-200',
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
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
              style={{ transitionDelay: open ? `${i * 30}ms` : '0ms' }}
              className={cn(
                'flex items-center gap-3 pl-4 pr-5 h-12 rounded-2xl font-medium shadow-xl transition-all active:scale-95',
                item.accent
                  ? 'bg-emerald-600 text-white'
                  : active
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              )}
            >
              <Icon size={18} />
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => { setOpen(false); handleLogout() }}
          style={{ transitionDelay: open ? `${items.length * 30}ms` : '0ms' }}
          className="flex items-center gap-3 pl-4 pr-5 h-12 rounded-2xl font-medium shadow-xl bg-red-900/80 text-red-100 border border-red-800 active:scale-95"
        >
          <LogOut size={18} />
          <span className="text-sm">Çıkış</span>
        </button>
      </div>

      {/* FAB toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
        className={cn(
          'fixed bottom-6 right-4 z-50 h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90',
          open
            ? 'bg-zinc-800 text-white rotate-90'
            : 'bg-indigo-600 text-white hover:bg-indigo-500'
        )}
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>
    </>
  )
}
