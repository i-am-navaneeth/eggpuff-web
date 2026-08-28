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
  snapshotAt?: string | null,
  cursorScore?: number | null,
  cursorId?: string | null
): Promise<QuestionRow[]> {

  const {
    data,
    error,
  } = await supabase.rpc(
    'get_smart_feed',
    {
      p_user_id: userId,
      p_limit: PAGE_SIZE,

      p_snapshot_at:
        snapshotAt ?? null,

      p_cursor_score:
        cursorScore ?? null,

      p_cursor_id:
        cursorId ?? null,
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