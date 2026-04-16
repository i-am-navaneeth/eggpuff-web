import { supabase } from './supabase'

export async function createNotification({
  userId,
  type,
  message,
  link,
  actorId,
}: {
  userId: string
  type: string
  message: string
  link?: string
  actorId?: string
}) {
  if (!userId) return

  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    message,
    link,
    actor_id: actorId,
  })
}