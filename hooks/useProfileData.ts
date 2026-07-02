'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function useProfileData() {
  const [loading, setLoading] =
    useState(true)

  const [profile, setProfile] =
    useState<any>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const user = session?.user

      if (!user) {
        if (mounted) {
          setLoading(false)
        }
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!mounted) return

      setProfile(data)
      setLoading(false)
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  return {
    profile,
    loading,
    setProfile,
  }
}