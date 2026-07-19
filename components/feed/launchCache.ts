'use client'

import type {
  CategoryWithCount,
  QuestionRow,
} from './types'

export const LAUNCH_CACHE_VERSION = 1

export const LAUNCH_CACHE_PREFIX =
  'feed_launch_cache_'

export const DEFAULT_CACHE_MAX_AGE =
  5 * 60 * 1000 // 5 minutes

export type LaunchCache = {
  version: number
  timestamp: number

  categories: CategoryWithCount[]

  promoted: {
    link: string
    creator: {
      user_id: string
      name: string
      username: string
      avatar_url: string | null
      is_verified: boolean
      streak_count: number
      college_id: string | null
    } | null
  }[]
}

function getKey(userId: string) {
  return `${LAUNCH_CACHE_PREFIX}${userId}`
}

function storageAvailable() {
  return (
    typeof window !== 'undefined' &&
    typeof localStorage !== 'undefined'
  )
}

export function saveLaunchCache(
  userId: string,
  cache: Omit<
    LaunchCache,
    'version' | 'timestamp'
  >
) {
  if (!storageAvailable()) return

  try {
    const payload: LaunchCache = {
      version: LAUNCH_CACHE_VERSION,
      timestamp: Date.now(),
      ...cache,
    }

    localStorage.setItem(
      getKey(userId),
      JSON.stringify(payload)
    )
  } catch (err) {
    console.warn(
      'Failed to save launch cache',
      err
    )
  }
}

export function loadLaunchCache(
  userId: string
): LaunchCache | null {
  if (!storageAvailable()) return null

  try {
    const raw =
      localStorage.getItem(getKey(userId))

    if (!raw) return null

    const parsed =
      JSON.parse(raw) as LaunchCache

    if (
      parsed.version !==
      LAUNCH_CACHE_VERSION
    ) {
      clearLaunchCache(userId)
      return null
    }

    return parsed
  } catch (err) {
    console.warn(
      'Corrupted launch cache removed',
      err
    )

    clearLaunchCache(userId)

    return null
  }
}

export function clearLaunchCache(
  userId: string
) {
  if (!storageAvailable()) return

  try {
    localStorage.removeItem(
      getKey(userId)
    )
  } catch {}
}

export function isLaunchCacheFresh(
  cache: LaunchCache | null,
  maxAge =
    DEFAULT_CACHE_MAX_AGE
) {
  if (!cache) return false

  return (
    Date.now() - cache.timestamp <
    maxAge
  )
}