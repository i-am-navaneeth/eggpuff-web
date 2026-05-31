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
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!existing) {
  const source = localStorage.getItem('ep_source')

  await supabase.from('profiles').insert({
    user_id: user.id,
    name: user.user_metadata?.name || 'User',
    username:
      (user.email?.split('@')[0] || 'user') +
      '_' +
      user.id.slice(0, 4),
    email: user.email,
    avatar_url: user.user_metadata?.avatar_url || null,

    source, // 👈 Mail tracking
  })
}

        // ✅ ONLY redirect if we are on auth callback page
        if (window.location.search.includes('code=')) {
  router.replace('/feed')
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