import webpush from 'web-push'
import { supabase } from '@/lib/supabase'

// 🔥 SAFE INIT (prevents build crash)
function initWebPush() {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    throw new Error('VAPID keys missing')
  }

  webpush.setVapidDetails(
    'mailto:you@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

export async function sendPushToAll(title: string, body: string) {
  initWebPush()

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')

  if (error) {
    console.error('❌ Supabase fetch error:', error)
    return
  }

  for (const row of data) {
    try {
      const pushSub = {
        endpoint: row.endpoint,
        keys: {
          p256dh: row.p256dh,
          auth: row.auth,
        },
      }

      await webpush.sendNotification(
        pushSub,
        JSON.stringify({
          title,
          body,
          url: '/feed',
        })
      )
    } catch (err: any) {
      console.error('❌ Push error:', err)

      if (err.statusCode === 410 || err.statusCode === 404) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('id', row.id)
      }
    }
  }
}

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  url: string = '/feed'
) {
  initWebPush()

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (error || !data) return

  for (const row of data) {
    try {
      const pushSub = {
        endpoint: row.endpoint,
        keys: {
          p256dh: row.p256dh,
          auth: row.auth,
        },
      }

      // 🚫 SKIP IF USER IS ACTIVE (last 2 min)
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_active_at')
        .eq('id', userId)
        .maybeSingle()

      const isActive =
        profile?.last_active_at &&
        Date.now() - new Date(profile.last_active_at).getTime() < 2 * 60 * 1000

      if (isActive) {
        console.log('🚫 Skipped push (user active)')
        return
      }

      // ⏳ SMALL DELAY (ANTI-SPAM GROUPING)
      await new Promise((res) => setTimeout(res, 15000))

      await webpush.sendNotification(
        pushSub,
        JSON.stringify({
          title,
          body,
          url,
        })
      )
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('id', row.id)
      }
    }
  }
}