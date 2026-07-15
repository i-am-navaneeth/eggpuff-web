import { supabase } from '@/lib/supabase'

const PUBLIC_VAPID_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat(
    (4 - (base64String.length % 4)) % 4
  )

  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  )
}

export async function registerBrowserSubscription() {
  if (typeof window === 'undefined') return

  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers are not supported.')
  }

  if (!('PushManager' in window)) {
    throw new Error('Push Notifications are not supported.')
  }

  const registration = await navigator.serviceWorker.ready

  let subscription =
    await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not logged in.')
  }

  const keys = subscription.toJSON().keys

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: keys?.p256dh,
        auth: keys?.auth,
      },
      {
        onConflict: 'endpoint',
      }
    )

  if (error) {
    console.error('Failed to save push subscription', error)
    throw error
  }

  console.log('✅ Push subscription saved.')
}