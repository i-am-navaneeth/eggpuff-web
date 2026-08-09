import { supabase } from '@/lib/supabase'

export async function getMatch(
  matchId: string
) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const currentUserId =
    session?.user.id ?? null

  // Match
  const { data: match, error } =
    await supabase
      .from('campus_matches')
      .select('*')
      .eq('id', matchId)
      .maybeSingle()

  if (error) throw error

  if (!match) return null

  // Creator
  const { data: creator } =
    await supabase
      .from('profiles')
      .select(
        'user_id,name,avatar_url,college_id'
      )
      .eq(
        'user_id',
        match.creator_id
      )
      .maybeSingle()

 // Members (only active members)
const { data: members } =
  await supabase
    .from('campus_match_members')
    .select(
      `
      user_id,
      joined_at,
      status,
      profiles (
        user_id,
        name,
        avatar_url
      )
      `
    )
    .eq('match_id', matchId)
    .eq('status', 'joined')
    .order('joined_at')

const activeMembers =
  members ?? []

const joined =
  activeMembers.some(
    (member: any) =>
      member.user_id === currentUserId
  )

const isCreator =
  currentUserId === match.creator_id

return {
  ...match,

  // Always derive this from the actual joined members
  participant_count:
    activeMembers.length,

  creator,

  members: activeMembers,

  joined,

  isCreator,

  current_user_id: currentUserId,
}
}