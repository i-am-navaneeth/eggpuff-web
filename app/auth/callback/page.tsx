'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase' // ✅ ADD THIS

export default function AuthCallback() {
const router = useRouter()

useEffect(() => {
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
      await supabase.from('profiles').insert({
        user_id: user.id,
        name: user.user_metadata?.name || 'User',
        username:
          (user.email?.split('@')[0] || 'user') +
          '_' +
          user.id.slice(0, 4),
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url || null,
      })
    }
  }

  router.replace('/feed')
}

handleUser()

}, [router])

return ( <div className="flex items-center justify-center min-h-screen">
Logging you in... </div>
)
}
