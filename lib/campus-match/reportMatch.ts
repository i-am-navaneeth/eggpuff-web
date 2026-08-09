import { supabase } from '@/lib/supabase'

export async function reportMatch(
  matchId: string
) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user

  if (!user) {
    throw new Error('Login required.')
  }

  // Prevent duplicate reports
  const { data: existing } =
    await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('match_id', matchId)
      .eq('report_type', 'campus_match')
      .maybeSingle()

  if (existing) {
  return {
    success: true,
    alreadyReported: true,
    reportCount: null,
  }
}

  // Insert report
  const { error: insertError } =
  await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      report_type: 'campus_match',
      match_id: matchId,
    })

if (insertError) {
  // Duplicate report -> treat as success
  if (insertError.code === '23505') {
    return {
      success: true,
      alreadyReported: true,
      reportCount: null,
    }
  }

  throw insertError
}

  // Count reports
  const {
    count,
    error: countError,
  } = await supabase
    .from('reports')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('match_id', matchId)
    .eq('report_type', 'campus_match')

  if (countError) {
    throw countError
  }

  // Auto remove after 3 reports
  if ((count ?? 0) >= 3) {
    const { data: match } =
      await supabase
        .from('campus_matches')
        .select('creator_id')
        .eq('id', matchId)
        .maybeSingle()

    await supabase
      .from('campus_matches')
      .delete()
      .eq('id', matchId)

    if (match?.creator_id) {
      await supabase
        .from('notifications')
        .insert({
          user_id: match.creator_id,
          actor_id: user.id,
          type: 'campus_match_removed',
          title: 'Campus Match Removed',
          message:
            'Your Campus Match was removed after receiving multiple reports.',
          link: '/campus-match',
        })
    }
  }

  return {
  success: true,
  alreadyReported: false,
  reportCount: count ?? 1,
}
}