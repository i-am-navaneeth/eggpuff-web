'use client'

import { ReactNode, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { NotificationProvider, useNotify } from './NotificationProvider'

/* ------------------------------------------------ */
/* 🔥 INTERNAL LOGIC WRAPPER (Inside Provider)     */
/* ------------------------------------------------ */

function UserLogic({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const { notify } = useNotify()

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    let cleanupListeners: (() => void) | null = null

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setReady(true)

      if (!session?.user) return

      const userId = session.user.id

      /* ------------------------------------------------ */
      /* 🎉 WELCOME BONUS CHECK                          */
      /* ------------------------------------------------ */
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('welcome_shown')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code,
        })
      }

      if (profile && profile.welcome_shown === false) {
        notify('🎉 Welcome to EggPuff! You received 5 free 🥐 EP.')

        await supabase
          .from('profiles')
          .update({ welcome_shown: true })
          .eq('id', userId)
      }

      /* ------------------------------------------------ */
      /* 🔴 Update last_active_at safely                  */
      /* ------------------------------------------------ */
      const updateActivity = async () => {
        const { error } = await supabase
          .from('profiles')
          .update({
            last_active_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (error) {
          console.error('Activity update error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          })
        }
      }

      // 🔥 Initial update
      await updateActivity()

      // 🔄 Interval update every 30 seconds
      interval = setInterval(updateActivity, 30000)

      // 🖱 Throttled interaction update
      let lastInteraction = 0
      const handleActivity = () => {
        const now = Date.now()
        if (now - lastInteraction > 15000) {
          lastInteraction = now
          updateActivity()
        }
      }

      window.addEventListener('click', handleActivity)
      window.addEventListener('keydown', handleActivity)
      window.addEventListener('focus', handleActivity)

      cleanupListeners = () => {
        window.removeEventListener('click', handleActivity)
        window.removeEventListener('keydown', handleActivity)
        window.removeEventListener('focus', handleActivity)
      }
    }

    init()

    return () => {
      if (interval) clearInterval(interval)
      if (cleanupListeners) cleanupListeners()
    }
  }, [notify])

  if (!ready) return null

  return <>{children}</>
}

/* ------------------------------------------------ */
/* 🧱 MAIN PROVIDER                                */
/* ------------------------------------------------ */

export default function UserProvider({
  children,
}: {
  children: ReactNode
}) {
  return (
    <NotificationProvider>
      <UserLogic>{children}</UserLogic>
    </NotificationProvider>
  )
}
