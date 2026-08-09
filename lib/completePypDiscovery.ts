import { supabase } from '@/lib/supabase'
import { getUserId } from '@/components/feed/api'
import {
  getPendingPypDiscovery,
  clearPendingPypDiscovery,
} from './pypDiscovery'

const MIN_DISCOVERY_MS = 10_000

export async function completePypDiscovery() {
  const pending = getPendingPypDiscovery()

  if (!pending) return

  // IMPORTANT:
  // Consume the session immediately so it can never
  // be processed twice.
  clearPendingPypDiscovery()

  const elapsed =
    Date.now() - pending.startedAt

  if (elapsed < MIN_DISCOVERY_MS) {
    return
  }

  try {
    const userId = await getUserId()

    if (!userId) {
      clearPendingPypDiscovery()
      return
    }

    const { error } = await supabase.rpc(
      'record_pyp_discovery',
      {
        p_user_id: userId,
        p_promotion_id: pending.promotionId,
      }
    )

    if (error) {
      console.error(error)
    }
  } catch (err) {
    console.error(err)
  }
}