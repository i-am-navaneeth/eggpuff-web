import { supabase } from '@/lib/supabase'

export async function joinMatch(
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

  // Join member
  const { error: memberError } =
    await supabase
      .from('campus_match_members')
      .upsert(
        {
          match_id: matchId,
          user_id: userId,
          status: 'joined',
          left_at: null,
        },
        {
          onConflict:
            'match_id,user_id',
        }
      )

  if (memberError) throw memberError

 // Fetch all active members
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