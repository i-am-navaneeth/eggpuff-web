'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// 🔥 keep helper outside (avoids re-creation on every run)
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

export default function PushInit() {
  useEffect(() => {
    const init = async () => {
      try {
        if (!('serviceWorker' in navigator)) return
        if (!('PushManager' in window)) return

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const reg = await navigator.serviceWorker.register('/sw.js')

        // 🔥 ensure SW is active
        await navigator.serviceWorker.ready

        if (!navigator.serviceWorker.controller) {
          console.log('⚠️ No controller yet — reloading...')
          window.location.reload()
          return
        }

        // 🔥 avoid duplicate subscriptions
        let sub = await reg.pushManager.getSubscription()

        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
            ),
          })
        }

        console.log('🚀 Sending subscription...')

        const {
          data: { user },
        } = await supabase.auth.getUser()

        try {
          const res = await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: sub.endpoint,
              keys: sub.toJSON().keys,
              user_id: user?.id ?? null,
            }),
            cache: 'no-store',
          })

          const data = await res.json()
          
        } catch (err) {
          console.error('❌ FETCH FAILED:', err)
        }

        
      } catch (err) {
        console.error('❌ Push init error:', err)
      }
    }

    init()
  }, [])

  return null
}