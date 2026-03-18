import webpush from 'web-push'
import { supabase } from '@/lib/supabase'

webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushToAll(title: string, body: string) {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id, subscription')

  if (error) {
    console.error('❌ Supabase fetch error:', error)
    return
  }

  for (const row of data) {
    try {
      await webpush.sendNotification(
        row.subscription,
        JSON.stringify({ title, body })
      )
    } catch (err: any) {
      console.error('❌ Push error:', err)

      // 🔥 Auto-clean invalid subscriptions (IMPORTANT)
      if (err.statusCode === 410 || err.statusCode === 404) {
        console.log('🧹 Removing invalid subscription:', row.id)

        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('id', row.id)
      }
    }
  }
}