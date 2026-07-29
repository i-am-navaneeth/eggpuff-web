import { startPypDiscovery } from '@/lib/pypDiscovery'
import { isBlockedDomain } from './isBlockedDomain'
import { supabase } from '@/lib/supabase'

export async function openExternal(
  promotionId: string,
  rawUrl: string
) {
  if (!rawUrl) return

  const normalizedUrl =
    /^https?:\/\//i.test(rawUrl)
      ? rawUrl
      : `https://${rawUrl}`

      console.log('rawUrl:', rawUrl)
console.log('normalizedUrl:', normalizedUrl)

  // Safety filter
if (isBlockedDomain(normalizedUrl)) {
  alert('This website is not supported.')
  return
}

// Record visit
try {
  const { error } = await supabase.rpc(
    'record_pyp_visit',
    {
      p_promotion_id: promotionId,
    }
  )

  if (error) {
    console.error(error)
  } else {
    // Start discovery timer
    startPypDiscovery(promotionId)
  }
} catch (err) {
  console.error(err)
}

window.location.href = normalizedUrl
}