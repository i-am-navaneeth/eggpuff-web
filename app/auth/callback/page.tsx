'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const hasRun = useRef(false) // 🔥 prevent double execution

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const handleUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
       const { data: existing } = await supabase
  .from('profiles')
  .select('user_id, profile_completed')
          .eq('user_id', user.id)
          .maybeSingle()

        let profile = existing

if (!profile) {
  const source = localStorage.getItem('ep_source')

  const { data } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      name: user.user_metadata?.name || 'User',
      username:
        (user.email?.split('@')[0] || 'user') +
        '_' +
        user.id.slice(0, 4),
      email: user.email,
      avatar_url:
        user.user_metadata?.avatar_url || null,
      source,

      // New users must complete profile
      profile_completed: false,
    })
    .select()
    .single()

  profile = data
}

if (window.location.search.includes('code=')) {
  if (profile?.profile_completed) {
    router.replace('/feed')
  } else {
    router.replace('/profile')
  }
}
      }
    }

    handleUser()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      Logging you in...
    </div>
  )
}