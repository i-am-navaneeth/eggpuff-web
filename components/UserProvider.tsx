'use client'

import { ReactNode, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { NotificationProvider } from './NotificationProvider'

export default function UserProvider({
  children,
}: {
  children: ReactNode
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // 🔒 hydrate auth session ONCE
    supabase.auth.getSession().finally(() => {
      setReady(true)
    })
  }, [])

  // ⏳ prevent rendering before auth is ready
  if (!ready) return null

  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  )
}
