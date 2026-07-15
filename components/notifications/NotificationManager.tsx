'use client'

import NotificationPrompt from './NotificationPrompt'
import useNotificationPrompt from '@/hooks/useNotificationPrompt'
import { registerBrowserSubscription } from '@/lib/pushClient'

export default function NotificationManager() {
  const {
    open,
    closePrompt,
  } = useNotificationPrompt()

  const handleEnable = async () => {
    if (!('Notification' in window)) {
      closePrompt()
      return
    }

    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      localStorage.removeItem('ep_notification_prompt_until')
      try {
        await registerBrowserSubscription()
      } catch (err) {
        console.error(err)
      }
    }

    closePrompt()
  }

  return (
    <NotificationPrompt
      open={open}
      onClose={closePrompt}
      onEnable={handleEnable}
    />
  )
}