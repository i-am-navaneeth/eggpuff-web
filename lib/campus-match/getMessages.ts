import { supabase } from '@/lib/supabase'

export async function getMessages(
  matchId: string
) {
  const { data, error } =
    await supabase
      .from('campus_match_messages')
      .select(
        `
        id,
        message,
        created_at,
        user_id,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq('match_id', matchId)
      .order('created_at', {
        ascending: true,
      })

  if (error) throw error

  return (data ?? []).map((msg: any) => ({
    ...msg,
    sender_name:
      msg.profiles?.full_name ||
      msg.profiles?.username ||
      'Student',
    avatar:
      msg.profiles?.avatar_url ??
      null,
  }))
}