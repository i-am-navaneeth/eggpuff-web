const KEY = 'ep_feed_prefs'

export type FeedPrefs = {
  hiddenIds: string[]
  likedTypes: string[]
  dislikedTypes: string[]
}

// 🔥 DEFAULT
function defaultPrefs(): FeedPrefs {
  return {
    hiddenIds: [],
    likedTypes: [],
    dislikedTypes: [],
  }
}

// 🔥 GET
export function getPrefs(): FeedPrefs {
  if (typeof window === 'undefined') return defaultPrefs()

  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultPrefs()

    const parsed = JSON.parse(raw)

    return {
      hiddenIds: parsed.hiddenIds || [],
      likedTypes: parsed.likedTypes || [],
      dislikedTypes: parsed.dislikedTypes || [],
    }
  } catch {
    return defaultPrefs()
  }
}

// 🔥 SAVE
export function savePrefs(prefs: FeedPrefs) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(KEY, JSON.stringify(prefs))
  } catch (err) {
    console.error('Failed to save feed prefs:', err)
  }
}

// 🔥 TYPE DETECTION (light heuristic)
export function detectType(q: any) {
  const text = (q.text || '').toLowerCase()

  if (text.length < 80) return 'short'
  if (text.length > 200) return 'long'
  if (text.includes('?')) return 'question'

  return 'general'
}

// 🔥 HELPERS (optional but clean)

export function markHelpful(q: any) {
  const prefs = getPrefs()
  const type = detectType(q)

  if (!prefs.likedTypes.includes(type)) {
    prefs.likedTypes.push(type)
  }

  savePrefs(prefs)
}

export function markNotUseful(q: any) {
  const prefs = getPrefs()
  const type = detectType(q)

  // 🔥 hide this question
  if (!prefs.hiddenIds.includes(q.id)) {
    prefs.hiddenIds.push(q.id)
  }

  // 🔥 mark type disliked
  if (!prefs.dislikedTypes.includes(type)) {
    prefs.dislikedTypes.push(type)
  }

  // 🔥 prevent unbounded growth
  if (prefs.hiddenIds.length > 100) {
    prefs.hiddenIds = prefs.hiddenIds.slice(-100)
  }

  savePrefs(prefs)
}