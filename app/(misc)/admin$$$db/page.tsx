'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminClient from './AdminClient'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  const router = useRouter()

useEffect(() => {
  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()


    if (!profile || !profile.is_admin) {
      router.replace('/feed')
      return
    }

    setAuthorized(true)
    setLoading(false)
  }

  checkAdmin()
}, [])

  if (loading) return <p style={{ padding: 20 }}>Loading…</p>

  if (!authorized) return null

  return <AdminClient />
}