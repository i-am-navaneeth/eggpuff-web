import { supabase } from '@/lib/supabase'

type Filters = {
  activity?: string
  mode?: string
  search?: string
}

export async function getMatches({
  activity,
  mode,
  search,
}: Filters = {}) {
  let query = supabase
    .from('campus_matches')
    .select(
      `
      *,
      creator:profiles!campus_matches_creator_id_fkey(
        id,
        name,
        avatar_url
      ),
      campus_match_members(
  user_id,
  status
)
    `
    )
    .eq('status', 'active')
    .order('created_at', {
      ascending: false,
    })

  if (activity) {
    query = query.eq(
      'activity',
      activity
    )
  }

  if (mode) {
    query = query.eq(
      'mode',
      mode
    )
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%`
    )
  }

  const { data, error } =
    await query

  if (error) throw error

  return (
    data?.map((match: any) => ({
      ...match,
      creator_name:
        match.creator?.name ??
        'Student',
      creator_avatar:
        match.creator
          ?.avatar_url,
      member_count:
  match.campus_match_members?.filter(
    (member: any) =>
      member.status === 'joined'
  ).length ??
  match.participant_count ??
  0,
    })) ?? []
  )
}