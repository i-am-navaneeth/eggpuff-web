'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        router.replace('/feed') // ✅ after login go here
      } else {
        router.replace('/login')
      }
    }

    handleAuth()
  }, [router])

  return <p className="text-center mt-10">Logging you in...</p>
}