import { supabase } from '@/lib/supabase'

export async function reportResource(
  resourceId: string
) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user

  if (!user) {
    throw new Error(
      'You must be logged in to report a resource.'
    )
  }

  const { error } =
    await supabase.rpc(
      'report_resource',
      {
        p_reporter_id: user.id,
        p_resource_id: resourceId,
      }
    )

  if (error) {
    throw error
  }

  return true
}