'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Notification = {
  id: string
  user_id: string
  actor_id: string
  type: string
  message: string
  link: string
  is_read: boolean
  created_at: string
}

type Sender = {
  id: string
  username: string
  avatar_url: string
}

function formatTime(dateString: string) {
  const now = new Date()
  const date = new Date(dateString + 'Z') // 🔥 KEY FIX

  const diff = (now.getTime() - date.getTime()) / 1000

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`

  return date.toLocaleDateString()
}

export default function NotificationsPage() {
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [senders, setSenders] = useState<Record<string, Sender>>({})

  const [animateBell, setAnimateBell] = useState(true)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setAnimateBell(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // ================= USER =================
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession()
      const user = data?.session?.user
      if (user) setUserId(user.id)
    }
    loadUser()
  }, [])

  // ================= FETCH =================
useEffect(() => {
  if (!userId) return

  const fetchNotifications = async () => {
    setLoading(true)

    // 🔥 1. Fetch notifications first
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    const list = (data as Notification[]) || []

    // 🔥 2. Prepare sender IDs early
    const senderIds = [...new Set(list.map(n => n.actor_id))]

    // 🔥 3. Fetch profiles IN PARALLEL
    const profilesPromise =
      senderIds.length > 0
        ? supabase
            .from('profiles')
            .select('user_id, username, avatar_url')
            .in('user_id', senderIds)
        : Promise.resolve({ data: [] })

    const [{ data: profiles }] = await Promise.all([
      profilesPromise,
    ])

    // 🔥 4. Build sender map BEFORE render
    const map: Record<string, Sender> = {}

    profiles?.forEach((p: any) => {
      map[p.user_id] = {
        id: p.user_id,
        username: p.username,
        avatar_url: p.avatar_url,
      }
    })

    // 🔥 5. SET EVERYTHING ONCE (no flicker)
    setSenders(map)
    setNotifications(list)

    // 🔥 Auto mark as read
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    // 🔥 Sync navbar
    window.dispatchEvent(new Event('notifications-read'))

    setLoading(false)
  }

  fetchNotifications()
}, [userId])

  // ================= REALTIME =================
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [
            payload.new as Notification,
            ...prev,
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // ================= NAVIGATION =================
  const handleClick = (n: Notification) => {
    if (n.type === 'follow') {
      router.push(`/u/${senders[n.actor_id]?.username}`)
      return
    }

    if (n.link) {
      router.push(n.link)
      return
    }
  }

  // ================= TIME FORMAT =================
  function formatTime(created_at: string) {
    const now = new Date()
    const date = new Date(created_at + 'Z')

    const diff = (now.getTime() - date.getTime()) / 1000

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`

    return date.toLocaleDateString()
  }


  // ================= UI =================
  return (
    <div className="max-w-[600px] mx-auto pb-[80px]">

      {/* LIST */}
      <div className="flex flex-col">

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-20 text-center px-6">

<div className="mb-4 flex justify-center">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-10 h-10 text-gray-400 origin-top ${
      animateBell ? 'animate-bell-ring' : ''
    }`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11
         a6.002 6.002 0 00-4-5.659V5
         a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159
         c0 .538-.214 1.055-.595 1.436L4 17h5m6 0
         a3 3 0 11-6 0"
    />
  </svg>
</div>

  <p className="text-base font-medium text-black mb-1">
    You're all caught up
  </p>

  <p className="text-sm text-gray-500 mb-4">
    Follow people to see activity here
  </p>

  <button
  onClick={() => router.push('/feed')}
  className="px-6 py-2.5 rounded-full text-sm font-medium transition active:scale-[0.96]"
  style={{
    backgroundColor: '#E5A74F',
    color: 'white',
    boxShadow: '0 6px 14px rgba(229, 167, 79, 0.35)',
  }}
>
  Explore
</button>

</div>
        )}

        {notifications.map((n) => {
          const sender = senders[n.actor_id]

          return (
            <div
  key={n.id}
  onClick={() => handleClick(n)}
  className={`flex gap-3 px-4 py-3 cursor-pointer transition ${
    n.is_read ? 'bg-white' : 'bg-[#f9f9f9]'
  }`}
>

  {/* Avatar */}
  <img
    src={sender?.avatar_url || '/default-avatar.png'}
    className="w-10 h-10 rounded-full object-cover"
  />

  {/* Content */}
  <div className="flex-1">

    {/* Line 1 */}
    <div className="text-sm leading-snug">
      <span className="font-medium text-black">
        @{sender?.username || 'user'}
      </span>{' '}
      <span className="text-gray-600">
        {n.message}
      </span>
    </div>

    {/* Time */}
    <div className="text-xs text-gray-400 mt-1">
      {formatTime(n.created_at)}
    </div>

  </div>

</div>
          )
        })}

      </div>
    </div>
  )
}