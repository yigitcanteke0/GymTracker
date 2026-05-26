'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-9">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-accent-600 mx-auto flex items-center justify-center shadow-lg shadow-accent-950/40">
            <Dumbbell size={24} className="text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-stone-50 font-semibold text-[22px] tracking-tight">
              Hesap Oluştur
            </h1>
            <p className="text-stone-500 text-[14px] mt-1">
              Antrenmanlarını takip etmeye başla
            </p>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.08em] block px-0.5">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full h-12 bg-stone-900 text-stone-100 rounded-xl px-4 border border-stone-800/80 focus:border-accent-600/60 outline-none placeholder-stone-600 transition-colors"
              placeholder="sen@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.08em] block px-0.5">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-12 bg-stone-900 text-stone-100 rounded-xl px-4 border border-stone-800/80 focus:border-accent-600/60 outline-none placeholder-stone-600 transition-colors"
              placeholder="En az 6 karakter"
            />
          </div>

          {error && (
            <p className="text-red-400 text-[13px] px-3 py-2 rounded-lg bg-red-950/30 border border-red-900/40">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Kaydediliyor…' : 'Hesap Oluştur'}
          </Button>
        </form>

        <p className="text-center text-stone-500 text-[13px]">
          Zaten hesabın var mı?{' '}
          <Link href="/login" className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  )
}
