const KEY = 'ep_pending_pyp_discovery'

export function startPypDiscovery(
  promotionId: string
) {
  const existing = getPendingPypDiscovery()

  // A discovery session is already in progress.
  if (existing) {
    return
  }

  const data = {
    promotionId,
    startedAt: Date.now(),
  }

  console.log('Saving discovery', data)

  localStorage.setItem(
    KEY,
    JSON.stringify(data)
  )
}

export function clearPendingPypDiscovery() {
  localStorage.removeItem(KEY)
}

export function getPendingPypDiscovery() {
  const raw = localStorage.getItem(KEY)

  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(KEY)
    return null
  }
}