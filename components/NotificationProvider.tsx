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
  exiting?: boolean
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
  // mark as exiting
  setNotifications(n =>
    n.map(x =>
      x.id === id ? { ...x, exiting: true } : x
    )
  )

  // remove after animation
  setTimeout(() => {
    setNotifications(n =>
      n.filter(x => x.id !== id)
    )
  }, 300) // match animation duration
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
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

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
            if (
              payload.new.user_id === user.id
            )
              return
            /* Disabled due to new Questions banner as X 
            notify(
              '📢 New campus question posted'
            )*/
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

  useEffect(() => {
  let channel: any
  let mounted = true

  const initNotifications = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const user = session?.user

    if (!user || !mounted) return

    /* 🔔 LOAD EXISTING UNREAD NOTIFICATIONS */
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: true })

    if (data && mounted) {
      data.forEach((n) => {
        notify(
          n.type === 'answer'
            ? `💬 ${n.message}`
            : n.type === 'answer_like'
            ? `❤️ ${n.message}`
            : n.type === 'community_alert'
            ? `📣 ${n.message}`
            : n.type === 'community_reply'
            ? `💬 ${n.message}`
            : n.message
        )
      })

      /* Mark only the notifications we just loaded as read */
      const ids = data.map((n) => n.id)

      if (ids.length > 0) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .in('id', ids)
      }
    }

    /* ⚡ REALTIME: NEW NOTIFICATIONS */
    channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (!mounted) return

          const n = payload.new

          notify(
            n.type === 'answer'
              ? `💬 ${n.message}`
              : n.type === 'answer_like'
              ? `❤️ ${n.message}`
              : n.type === 'community_alert'
              ? `📣 ${n.message}`
              : n.type === 'community_reply'
              ? `💬 ${n.message}`
              : n.message
          )

          /* Mark realtime notification as read */
          supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', n.id)
            .then(({ error }) => {
              if (error) {
                console.error(
                  'Failed to mark notification as read:',
                  error
                )
              }
            })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🔔 Notification realtime connected')
        }
      })
  }

  initNotifications()

  return () => {
    mounted = false

    if (channel) {
      supabase.removeChannel(channel)
    }
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
          zIndex: 1000,

          display: 'flex',                // ✅ stack toasts
          flexDirection: 'column',
          gap: 8,
          alignItems: 'center',

          maxWidth: '90%',
        }}
      >
        {notifications.map(n => (
          <div
            key={n.id}
            style={{
              background: '#111827',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: 16,
              fontSize: 13,
              boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
              pointerEvents: 'auto',

              maxWidth: '100%',
              width: 'fit-content',
              textAlign: 'center',
              lineHeight: 1.4,

              // ✅ TEXT FIX (main issue solved)
              whiteSpace: 'normal',
              wordBreak: 'break-word',

              animation: n.exiting
  ? 'fadeDown 0.25s ease forwards'
  : 'fadeUp 0.25s ease',
            }}
          >
            {n.message}
          </div>
        ))}
      </div>

      {/* 🔥 ANIMATION (FIXED POSITION) */}
      <style>
        {`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
            @keyframes fadeDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(10px);
  }
}
        `}
      </style>
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