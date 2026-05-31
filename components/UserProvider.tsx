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
  let mounted = true

  let interval:
    ReturnType<typeof setInterval> | null = null

  let cleanupListeners:
    (() => void) | null = null

  const init = async () => {
    try {

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      const user = session?.user

      if (!user) {
        setReady(true)
        return
      }

      const userId = user.id

      setReady(true)

      /* ------------------------------------------------ */
      /* 🎉 WELCOME BONUS CHECK                          */
      /* ------------------------------------------------ */

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select(
          'id, user_id, welcome_shown'
        )
        .eq('user_id', userId)
        .maybeSingle()

      if (!mounted) return

      if (profileError) {
        console.error(
          'Profile fetch error:',
          profileError
        )
      }

      if (
        profile &&
        profile.welcome_shown === false
      ) {

        notify(
          '🎉 Welcome to EggPuff! You received 5 free 🥐 EP.'
        )

        await supabase
          .from('profiles')
          .update({
            welcome_shown: true,
          })
          .eq('user_id', userId)

        await supabase
          .from('egg_puff_ledger')
          .insert({
            user_id: userId,
            amount: 5,
            reason: 'Welcome bonus',
          })
      }

      /* ------------------------------------------------ */
      /* 🔴 LAST ACTIVE                                  */
      /* ------------------------------------------------ */

      const updateActivity =
        async () => {

          if (!mounted) return

          const { error } =
            await supabase
              .from('profiles')
              .update({
                last_active_at:
                  new Date().toISOString(),
              })
              .eq(
                'user_id',
                userId
              )

          if (error) {
            console.error(
              'Activity update error:',
              error
            )
          }
        }

      await updateActivity()

      interval = setInterval(
        updateActivity,
        30000
      )

      let lastInteraction = 0

      const handleActivity =
        () => {

          const now = Date.now()

          if (
            now -
              lastInteraction >
            15000
          ) {

            lastInteraction = now

            updateActivity()
          }
        }

      window.addEventListener(
        'click',
        handleActivity
      )

      window.addEventListener(
        'keydown',
        handleActivity
      )

      window.addEventListener(
        'focus',
        handleActivity
      )

      cleanupListeners =
        () => {

          window.removeEventListener(
            'click',
            handleActivity
          )

          window.removeEventListener(
            'keydown',
            handleActivity
          )

          window.removeEventListener(
            'focus',
            handleActivity
          )
        }

    } catch (err) {

      console.error(
        'UserProvider init error:',
        err
      )

      if (mounted) {
        setReady(true)
      }
    }
  }

  init()

  return () => {

    mounted = false

    if (interval) {
      clearInterval(interval)
    }

    if (cleanupListeners) {
      cleanupListeners()
    }
  }
}, [notify])

if (!ready)
  return null

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