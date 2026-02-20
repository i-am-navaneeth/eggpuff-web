'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { supabase } from '../lib/supabase'

type Notification = {
  id: string
  message: string
}

type NotificationContextType = {
  notify: (msg: string) => void
  notifyComingSoon: () => void
}

const NotificationContext =
  createContext<NotificationContextType | null>(
    null
  )

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([])
  const counterRef = useRef(0)

  /* 🔔 BASE NOTIFY */
  const notify = (message: string) => {
    counterRef.current += 1
    const id = `${Date.now()}-${counterRef.current}`

    setNotifications(n => [...n, { id, message }])

    setTimeout(() => {
      setNotifications(n =>
        n.filter(x => x.id !== id)
      )
    }, 3000)
  }

  /* 🚧 MVP / COMING SOON NOTIFY */
  const notifyComingSoon = () => {
    notify('🚧 Coming soon — shipping in next updates')
  }

  /* 🟢 AUTO NOTIFY: NEW QUESTIONS */
  useEffect(() => {
    let channel: any
    let mounted = true

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !mounted) return

      channel = supabase
        .channel('notify-new-questions')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'questions',
          },
          payload => {
            // 🔕 skip own question
            if (
              payload.new.user_id === user.id
            )
              return

            notify(
              '📢 New campus question posted'
            )
          }
        )
        .subscribe()
    }

    init()

    return () => {
      mounted = false
      if (channel)
        supabase.removeChannel(channel)
    }
  }, [])

  return (
    <NotificationContext.Provider
      value={{ notify, notifyComingSoon }}
    >
      {children}

      {/* 🔔 TOAST CONTAINER */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 100,
          pointerEvents: 'none',
        }}
      >
        {notifications.map(n => (
          <div
            key={n.id}
            style={{
              background: '#111',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 999,
              fontSize: 14,
              boxShadow:
                '0 4px 10px rgba(0,0,0,0.2)',
              pointerEvents: 'auto',
            }}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

/* 🎯 HOOK */
export function useNotify() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error(
      'useNotify must be used inside NotificationProvider'
    )
  }
  return ctx
}
