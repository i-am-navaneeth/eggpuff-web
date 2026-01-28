'use client'

import { createContext, useContext, useState } from 'react'

type Notification = {
  id: number
  message: string
}

const NotificationContext = createContext<{
  notify: (msg: string) => void
} | null>(null)

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const notify = (message: string) => {
    const id = Date.now()
    setNotifications((n) => [...n, { id, message }])

    setTimeout(() => {
      setNotifications((n) => n.filter((x) => x.id !== id))
    }, 3000)
  }

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 100
      }}>
        {notifications.map(n => (
          <div
            key={n.id}
            style={{
              background: '#111',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 999,
              fontSize: 14,
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            }}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotify() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotify must be used inside NotificationProvider')
  return ctx.notify
}
