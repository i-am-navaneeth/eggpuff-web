import { supabase } from '@/lib/supabase'

export async function deleteMatch(matchId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user

  if (!user) {
    throw new Error('You must be logged in.')
  }

  const { error } = await supabase
    .from('campus_matches')
    .delete()
    .eq('id', matchId)
    .eq('creator_id', user.id)

  if (error) {
    throw error
  }
}