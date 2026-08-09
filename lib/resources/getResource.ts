import { supabase } from '@/lib/supabase'

export async function getResource(
  resourceId: string
) {
  const {
    data: resource,
    error,
  } = await supabase
    .from('resources')
    .select('*')
    .eq('id', resourceId)
    .maybeSingle()

  if (error) throw error

  if (!resource) return null

  const {
    data: profile,
  } = await supabase
    .from('profiles')
    .select(`
      name,
      college_id
    `)
    .eq(
      'user_id',
      resource.user_id
    )
    .maybeSingle()

  let collegeName: string | null =
    null

  if (profile?.college_id) {
    const {
      data: college,
    } = await supabase
      .from('colleges')
      .select('name')
      .eq(
        'id',
        profile.college_id
      )
      .maybeSingle()

    collegeName =
      college?.name ?? null
  }

  return {
    ...resource,

    uploader_name:
      profile?.name ?? null,

    college_name:
      collegeName,
  }
}