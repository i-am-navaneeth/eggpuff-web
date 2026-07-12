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
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

      if (!user) return

      const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(10)

if (!data) return

const actorIds = [
  ...new Set(
    data
      .map(n => n.actor_id)
      .filter(Boolean)
  ),
]

const { data: profiles } = await supabase
  .from('profiles')
  .select(`
  user_id,
  name,
  username,
  avatar_url,
  is_verified
`)
  .in('user_id', actorIds)

const profileMap = new Map(
  (profiles || []).map(p => [
    p.user_id,
    p,
  ])
)

setNotifications(
  data.map(n => ({
    ...n,
    actor: profileMap.get(n.actor_id),
  }))
)
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
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

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
      if (
        typeof n.link === 'string' &&
        n.link.startsWith('/') &&
        n.link !== 'null'
      ) {
        router.push(n.link)
      }

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', n.id)

      setNotifications(prev =>
        prev.map(x =>
          x.id === n.id
            ? { ...x, read: true }
            : x
        )
      )
    }}
    style={{
      padding: '12px',
      cursor: 'pointer',
      borderBottom: '1px solid #F3F4F6',
      background: n.read ? '#fff' : '#FFFBEB',
      transition: 'background .15s ease',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#F9FAFB'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = n.read
        ? '#FFFFFF'
        : '#FFFBEB'
    }}
  >
    {/* Avatar */}
    <img
      src={
        n.actor?.avatar_url ||
        '/default-avatar.png'
      }
      alt=""
      style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
      }}
    />

    <div
      style={{
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* Name + Action */}
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.45,
          color: '#111827',
        }}
      >
        <span
          style={{
            fontWeight: 700,
          }}
        >
          {n.actor?.name || 'Someone'}
        </span>{' '}

        {n.type === 'answer' && (
          <>answered your question</>
        )}

        {n.type === 'answer_like' && (
          <>liked your answer</>
        )}

        {!['answer', 'answer_like'].includes(n.type) && (
          <>sent you a notification</>
        )}
      </div>

      {/* Preview */}
      <div
        style={{
          marginTop: 4,
          color: '#6B7280',
          fontSize: 13,
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          wordBreak: 'break-word',
        }}
      >
        {n.message}
      </div>

      {/* Actions */}
      {(n.type === 'answer' ||
        n.type === 'answer_like') && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 10,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()

              if (n.link) {
                router.push(`${n.link}?reply=1`)
              }
            }}
            style={{
              border: 'none',
              background: '#F3F4F6',
              borderRadius: 999,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reply
          </button>

          <button
  onClick={async (e) => {
    e.stopPropagation()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const user = session?.user

    if (!user || !n.answer_id) return

    const { data: existing } = await supabase
      .from('answer_likes')
      .select('id')
      .eq('answer_id', n.answer_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) return

    await supabase
      .from('answer_likes')
      .insert({
        answer_id: n.answer_id,
        user_id: user.id,
      })
  }}
  style={{
    border: 'none',
    background: '#F3F4F6',
    borderRadius: 999,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  }}
>
  ❤️ Like
</button>
        </div>
      )}
    </div>
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