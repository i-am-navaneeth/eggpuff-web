import {
  FEED_LAST_VISIT_KEY,
} from './constants'

export const getLastVisit = () => {
  try {
    return (
      localStorage.getItem(
        FEED_LAST_VISIT_KEY
      ) || null
    )
  } catch {
    return null
  }
}

export const saveLastVisit = () => {
  try {
    localStorage.setItem(
      FEED_LAST_VISIT_KEY,
      new Date().toISOString()
    )
  } catch {}
}