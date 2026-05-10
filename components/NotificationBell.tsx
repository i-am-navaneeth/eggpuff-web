'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  /* ---------------- LOAD ---------------- */
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setNotifications(data || [])
    }

    load()
  }, [])

  /* ---------------- REALTIME ---------------- */
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        payload => {
          setNotifications(prev => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  /* ---------------- CLOSE OUTSIDE ---------------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  /* ---------------- MARK ALL AS READ ---------------- */
  const markAllRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)

    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      
      {/* 🔔 BELL */}
      <div
        onClick={() => setOpen(prev => !prev)}
        style={{
          cursor: 'pointer',
          fontSize: 18,
          position: 'relative',
        }}
      >
        🔔

        {unread > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -6,
              right: -10,
              background: '#EF4444',
              color: '#fff',
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            {unread}
          </span>
        )}
      </div>

      {/* 📦 DROPDOWN */}
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 34,
            width: 280,
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 14,
            padding: 10,
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            animation: 'fadeIn 0.2s ease',
            zIndex: 50,
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span>Notifications</span>

            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: 11,
                  color: '#2563EB',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
              >
                Mark all
              </button>
            )}
          </div>

          {/* LIST */}
          {notifications.length === 0 && (
            <p style={{ fontSize: 13, color: '#6B7280' }}>
              No notifications
            </p>
          )}

          {notifications.map(n => (
            <div
              key={n.id}
              onClick={async () => {
               if (typeof n.link === 'string' && n.link.startsWith('/')) {
  if (n.link && n.link !== 'null') {
  router.push(n.link)
}
}

                await supabase
                  .from('notifications')
                  .update({ read: true })
                  .eq('id', n.id)

                setNotifications(prev =>
                  prev.map(x =>
                    x.id === n.id ? { ...x, read: true } : x
                  )
                )
              }}
              style={{
                padding: '10px 8px',
                cursor: 'pointer',
                borderBottom: '1px solid #f3f4f6',
                fontSize: 13,
                borderRadius: 8,
                background: n.read ? '#fff' : '#F9FAFB',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
  e.currentTarget.style.backgroundColor = '#F3F4F6'
}}
onMouseLeave={(e) => {
  e.currentTarget.style.backgroundColor = n.read
    ? '#FFFFFF'
    : '#F9FAFB'
}}
            >
              {n.message}
            </div>
          ))}
        </div>
      )}

      {/* ✨ ANIMATION */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}