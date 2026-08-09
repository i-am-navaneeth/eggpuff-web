import { supabase } from '@/lib/supabase'

export async function sendMessage(
  matchId: string,
  message: string
) {
  const {
    data: { session },
  } =
    await supabase.auth.getSession()

  if (!session?.user)
    throw new Error(
      'Not authenticated.'
    )

  const { error } =
    await supabase
      .from(
        'campus_match_messages'
      )
      .insert({
        match_id: matchId,
        user_id: session.user.id,
        message: message.trim(),
      })

  if (error) throw error
}