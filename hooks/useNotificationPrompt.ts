'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ep_notification_prompt_until'

export default function useNotificationPrompt() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
  if (typeof window === 'undefined') return

  if (!('Notification' in window)) return

  if (Notification.permission === 'granted') return

const nextPrompt = localStorage.getItem(STORAGE_KEY)

if (
  nextPrompt &&
  Date.now() < Number(nextPrompt)
) {
  return
}

  let timerFinished = false
  let userInteracted = false

  const tryOpen = () => {
    if (timerFinished && userInteracted) {
      setOpen(true)
      removeListeners()
    }
  }

  const handleInteraction = () => {
    userInteracted = true
    tryOpen()
  }

  const removeListeners = () => {
    window.removeEventListener('scroll', handleInteraction)
    window.removeEventListener('click', handleInteraction)
    window.removeEventListener('touchstart', handleInteraction)
    window.removeEventListener('keydown', handleInteraction)
  }

  window.addEventListener('scroll', handleInteraction, { passive: true })
  window.addEventListener('click', handleInteraction)
  window.addEventListener('touchstart', handleInteraction, {
    passive: true,
  })
  window.addEventListener('keydown', handleInteraction)

  const timer = setTimeout(() => {
    timerFinished = true
    tryOpen()
  }, 20000)

  return () => {
    clearTimeout(timer)
    removeListeners()
  }
}, [])

  const closePrompt = () => {
  const tomorrow =
    Date.now() + 24 * 60 * 60 * 1000

  localStorage.setItem(
    STORAGE_KEY,
    tomorrow.toString()
  )

  setOpen(false)
}

  return {
    open,
    setOpen,
    closePrompt,
  }
}