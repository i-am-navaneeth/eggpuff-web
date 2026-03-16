import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createSupabaseServer()

  // ---------------- GET USER ----------------
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('Admin auth error:', userError)
    redirect('/login')
  }

  if (!user) {
    redirect('/login')
  }

  // ---------------- GET PROFILE ----------------
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Admin profile error:', profileError)
    redirect('/feed')
  }

  if (!profile || profile.role !== 'admin') {
    redirect('/feed')
  }

  return <AdminClient />
}