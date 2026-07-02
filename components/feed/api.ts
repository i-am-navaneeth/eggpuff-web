import { supabase } from '@/lib/supabase'

import { PAGE_SIZE } from './constants'

import type {
  QuestionRow,
} from './types'

export async function getUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.user?.id ?? null
}

export async function fetchPage(
  userId: string,
  pageOffset: number
): Promise<QuestionRow[]> {

  const {
    data,
    error,
  } = await supabase.rpc(
    'get_smart_feed',
    {
      p_user_id: userId,
      p_limit: PAGE_SIZE,
      p_offset: pageOffset,
    }
  )

  if (error) {
    console.warn(
      'RPC error',
      error
    )

    return []
  }

  return (data ?? []) as QuestionRow[]
}