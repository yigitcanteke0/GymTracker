'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <span className="text-5xl">🏋️</span>
          <h1 className="text-2xl font-bold text-white mt-4">Kayıt Ol</h1>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase tracking-wider">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full h-12 bg-zinc-800 text-white rounded-xl px-4 border border-zinc-700 focus:border-indigo-500 outline-none placeholder-zinc-500"
              placeholder="sen@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase tracking-wider">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-12 bg-zinc-800 text-white rounded-xl px-4 border border-zinc-700 focus:border-indigo-500 outline-none placeholder-zinc-500"
              placeholder="En az 6 karakter"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Kaydediliyor…' : 'Kayıt Ol'}
          </Button>
        </form>

        <p className="text-center text-zinc-500 text-sm">
          Zaten hesabın var mı?{' '}
          <Link href="/login" className="text-indigo-400 font-medium">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  )
}
