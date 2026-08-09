import { supabase } from '@/lib/supabase'

export async function leaveMatch(
  matchId: string
) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error(
      'User not logged in.'
    )
  }

  const userId = session.user.id

  // Mark member as left
  const { error: memberError } =
    await supabase
      .from('campus_match_members')
      .update({
        status: 'left',
        left_at: new Date().toISOString(),
      })
      .eq('match_id', matchId)
      .eq('user_id', userId)

  if (memberError) throw memberError

// Fetch active members
const {
  data: joinedMembers,
  error: membersError,
} = await supabase
  .from('campus_match_members')
  .select('user_id')
  .eq('match_id', matchId)
  .eq('status', 'joined')

if (membersError) throw membersError

const participantCount =
  joinedMembers.length

// Update cached participant count
const { error: updateError } =
  await supabase
    .from('campus_matches')
    .update({
      participant_count:
        participantCount,
    })
    .eq('id', matchId)

if (updateError) throw updateError
}