'use client'

import { supabase } from '@/lib/supabase'
import type { MatchDraft } from '@/components/campus-match/CreateMatch'

export async function createMatch(
  draft: MatchDraft
) {
  // ---------------------------------------
  // Current User
  // ---------------------------------------

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.user) {
    throw new Error('You must be logged in.')
  }

  const userId = session.user.id
  console.log('Auth User ID:', userId)

// ---------------------------------------
// User Profile
// ---------------------------------------

const {
  data: profile,
  error: profileError,
} = await supabase
  .from('profiles')
  .select(
    `
    college_id,
    name,
    avatar_url
    `
  )
  .eq('id', userId)
  .single()

if (profileError) {
  console.error(profileError)
  console.log(profileError)
throw new Error(
  JSON.stringify(profileError)
)
}

if (!profile) {
  throw new Error('Profile not found.')
}

  // ---------------------------------------
  // Create Match
  // ---------------------------------------

  const {
    data: match,
    error: matchError,
  } = await supabase
    .from('campus_matches')
    .insert({
  creator_id: userId,

  college_id: profile.college_id,

  activity: draft.activity,

  title: draft.title,

  description: draft.description,

  people_needed: draft.peopleNeeded,

  participant_count: 1,

  starts_at:
    draft.when === 'custom'
      ? draft.customDate
      : new Date().toISOString(),

  duration_minutes:
    draft.duration === '30 mins'
      ? 30
      : draft.duration === '1 hour'
      ? 60
      : draft.duration === '2 hours'
      ? 120
      : Number(draft.customDuration) || 60,

  mode: draft.mode,

  location:
    draft.mode === 'online'
      ? null
      : draft.location,

  requirements: draft.requirements,

  tags: draft.tags,

  status: 'active',

  max_participants:
    draft.peopleNeeded,
})
    .select()
    .single()

  if (matchError) {
    console.log(matchError)
throw new Error(
  JSON.stringify(matchError)
)
  }

  // ---------------------------------------
  // Creator joins automatically
  // ---------------------------------------

const { error: memberError } =
  await supabase
    .from('campus_match_members')
    .insert({
      match_id: match.id,

      user_id: userId,

      status: 'joined',
    })

if (memberError) {
  console.error(memberError)
  throw new Error(
    JSON.stringify(memberError)
  )
}

  return match
}