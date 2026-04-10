'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      // 🔥 This is the FIX
      const { data, error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      )

      if (error) {
        router.replace('/login')
        return
      }

      if (data.session) {
        router.replace('/feed')
      } else {
        router.replace('/login')
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      Logging you in...
    </div>
  )
}