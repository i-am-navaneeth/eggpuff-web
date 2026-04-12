'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/feed')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      Logging you in...
    </div>
  )
}