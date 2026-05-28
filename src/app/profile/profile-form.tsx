'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { withRetry } from '@/lib/retry'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'

interface ProfileFormProps {
  email: string
  initialFirstName: string
  initialLastName: string
}

export function ProfileForm({
  email,
  initialFirstName,
  initialLastName,
}: ProfileFormProps) {
  const supabase = createClient()
  const router = useRouter()

  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const dirty =
    firstName.trim() !== initialFirstName.trim() ||
    lastName.trim() !== initialLastName.trim()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const fn = firstName.trim()
    const ln = lastName.trim()
    if (!fn) {
      setError('Adın boş kalamaz')
      return
    }
    setSaving(true)
    setError('')

    try {
      await withRetry(async () => {
        const { error: err } = await supabase.auth.updateUser({
          data: {
            first_name: fn,
            last_name: ln,
            full_name: `${fn} ${ln}`.trim(),
          },
        })
        if (err) throw err
      })
      setSavedAt(Date.now())
      router.refresh()
      // toast geçici — 2s sonra söndür
      setTimeout(() => setSavedAt(null), 2200)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Kayıt edilemedi. Tekrar dene.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col pb-32">
      {/* Header */}
      <div className="sticky top-0 z-[8] px-3.5 pt-2.5 pb-3 bg-gradient-to-b from-bg via-bg/95 to-transparent">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            aria-label="Geri"
            className="w-9 h-9 rounded-xl bg-surface-2 text-fg-secondary shadow-[inset_0_0_0_0.5px_var(--color-border)] flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="flex-1 text-fg font-semibold text-[17px] tracking-[-0.01em]">
            Profil
          </h1>
        </div>
      </div>

      <div className="flex-1 px-5 pt-2 mx-auto w-full max-w-md">
        {/* Identity tile */}
        <div className="flex items-center gap-3 mb-7 mt-2">
          <div className="h-14 w-14 rounded-2xl bg-accent-600 flex items-center justify-center shadow-[inset_0_1px_0_rgb(255_255_255_/_0.18),0_6px_16px_-4px_var(--color-accent-950)]">
            <User size={24} className="text-white" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <Eyebrow tone="accent">Hesap</Eyebrow>
            <p className="text-fg text-[15px] font-semibold truncate mt-0.5">
              {email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <Eyebrow>Ad</Eyebrow>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                className="w-full h-12 bg-surface-2 text-fg rounded-[14px] px-4 shadow-[inset_0_0_0_0.5px_var(--color-border)] focus:shadow-[inset_0_0_0_1px_var(--color-accent-500)] outline-none placeholder:text-fg-tertiary transition-shadow text-[14px] font-medium tracking-[-0.005em]"
                placeholder="Ad"
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
                placeholder="Soyad"
              />
            </div>
          </div>

          {error && (
            <p className="text-[13px] px-3 py-2 rounded-lg bg-danger/10 text-danger shadow-[inset_0_0_0_0.5px_rgb(220_38_38_/_0.3)]">
              {error}
            </p>
          )}

          {savedAt && (
            <p className="text-[13px] px-3 py-2 rounded-lg bg-success/10 text-success shadow-[inset_0_0_0_0.5px_rgb(22_163_74_/_0.3)] inline-flex items-center gap-1.5 animate-fade-up">
              <Check size={14} strokeWidth={2.5} />
              Güncellendi
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            full
            disabled={saving || !dirty}
            className="mt-1"
          >
            {saving ? 'Kaydediliyor…' : 'Değişiklikleri Kaydet'}
          </Button>
        </form>
      </div>
    </div>
  )
}
