import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './profile-form'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const firstName =
    typeof meta.first_name === 'string'
      ? meta.first_name
      : typeof meta.full_name === 'string'
      ? meta.full_name.split(' ')[0] ?? ''
      : ''
  const lastName =
    typeof meta.last_name === 'string'
      ? meta.last_name
      : typeof meta.full_name === 'string'
      ? meta.full_name.split(' ').slice(1).join(' ') ?? ''
      : ''

  return (
    <ProfileForm
      email={user.email ?? ''}
      initialFirstName={firstName}
      initialLastName={lastName}
    />
  )
}
