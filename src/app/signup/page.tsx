'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const fn = firstName.trim()
    const ln = lastName.trim()
    if (!fn) {
      setError('Adınızı girin')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: fn,
          last_name: ln,
          full_name: `${fn} ${ln}`.trim(),
        },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-9">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-accent-600 mx-auto flex items-center justify-center shadow-[0_8px_24px_-8px_var(--color-accent-950)]">
            <Dumbbell size={24} className="text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-fg font-semibold text-[22px] tracking-tight">
              Hesap Oluştur
            </h1>
            <p className="text-fg-tertiary text-[14px] mt-1">
              Antrenmanlarını takip etmeye başla
            </p>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <Eyebrow>Ad</Eyebrow>
              <input
                autoFocus
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                className="w-full h-12 bg-surface-2 text-fg rounded-[14px] px-4 shadow-[inset_0_0_0_0.5px_var(--color-border)] focus:shadow-[inset_0_0_0_1px_var(--color-accent-500)] outline-none placeholder:text-fg-tertiary transition-shadow text-[14px] font-medium tracking-[-0.005em]"
                placeholder="Yiğitcan"
              />
            </div>
            <div className="space-y-1.5">
              <Eyebrow>Soyad</Eyebrow>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                autoComplete="family-name"
                className="w-full h-12 bg-surface-2 text-fg rounded-[14px] px-4 shadow-[inset_0_0_0_0.5px_var(--color-border)] focus:shadow-[inset_0_0_0_1px_var(--color-accent-500)] outline-none placeholder:text-fg-tertiary transition-shadow text-[14px] font-medium tracking-[-0.005em]"
                placeholder="Teke"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Eyebrow>E-posta</Eyebrow>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full h-12 bg-surface-2 text-fg rounded-[14px] px-4 shadow-[inset_0_0_0_0.5px_var(--color-border)] focus:shadow-[inset_0_0_0_1px_var(--color-accent-500)] outline-none placeholder:text-fg-tertiary transition-shadow text-[14px] font-medium tracking-[-0.005em]"
              placeholder="sen@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <Eyebrow>Şifre</Eyebrow>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full h-12 bg-surface-2 text-fg rounded-[14px] px-4 shadow-[inset_0_0_0_0.5px_var(--color-border)] focus:shadow-[inset_0_0_0_1px_var(--color-accent-500)] outline-none placeholder:text-fg-tertiary transition-shadow text-[14px] font-medium tracking-[-0.005em]"
              placeholder="En az 6 karakter"
            />
          </div>

          {error && (
            <p className="text-[13px] px-3 py-2 rounded-lg bg-danger/10 text-danger shadow-[inset_0_0_0_0.5px_rgb(220_38_38_/_0.3)]">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" full disabled={loading}>
            {loading ? 'Kaydediliyor…' : 'Hesap Oluştur'}
          </Button>
        </form>

        <p className="text-center text-fg-tertiary text-[13px]">
          Zaten hesabın var mı?{' '}
          <Link
            href="/login"
            className="text-accent-300 hover:opacity-90 font-semibold transition-opacity"
          >
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  )
}
