'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'ep_notification_last_sent'
const COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

function formatLastSent(timestamp: number | null) {
  if (!timestamp) return 'Never'

  const diff = Date.now() - timestamp

  const seconds = Math.floor(diff / 1000)

  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'} ago`
  }

  const minutes = Math.floor(seconds / 60)

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }

  const days = Math.floor(hours / 24)

  return `${days} day${days === 1 ? '' : 's'} ago`
}

export function useNotificationCooldown() {
  const [lastSent, setLastSent] =
    useState<number | null>(null)

  useEffect(() => {
    const value =
      localStorage.getItem(STORAGE_KEY)

    if (value) {
      setLastSent(Number(value))
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setLastSent(prev =>
        prev === null ? null : prev
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const remainingMs = useMemo(() => {
    if (!lastSent) return 0

    return Math.max(
      0,
      COOLDOWN_MS - (Date.now() - lastSent)
    )
  }, [lastSent])

  const canSend = remainingMs <= 0

  const startCooldown =
    useCallback(() => {
      const now = Date.now()

      localStorage.setItem(
        STORAGE_KEY,
        now.toString()
      )

      setLastSent(now)
    }, [])

  const clearCooldown =
    useCallback(() => {
      localStorage.removeItem(STORAGE_KEY)
      setLastSent(null)
    }, [])

  return {
    canSend,

    isCoolingDown: !canSend,

    cooldownRemaining:
      formatRemaining(remainingMs),

    secondsRemaining: Math.ceil(
      remainingMs / 1000
    ),

    lastSent,

    lastSentText:
      formatLastSent(lastSent),

    cooldownMinutes: 5,

    startCooldown,

    clearCooldown,
  }
}