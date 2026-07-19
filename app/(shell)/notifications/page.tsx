'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useNavigation } from '@/components/navigation/NavigationProvider'

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
  is_verified: boolean
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

  const {
  openProfile,
  openQuestion,
} = useNavigation()
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
        .select(`
          user_id,
          username,
          avatar_url,
          is_verified
        `)
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
  is_verified: p.is_verified,
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
 const handleClick = (
  n: Notification
) => {
  // ================= FOLLOW =================

  if (n.type === 'follow') {
    const username =
      senders[n.actor_id]?.username

    if (username) {
      openProfile(username)
    }

    return
  }

  // ================= QUESTION =================

  if (
    n.link?.startsWith('/question/')
  ) {
    const id =
      n.link.replace(
        '/question/',
        ''
      )

    openQuestion(id)

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


  return (
  <div className="max-w-[600px] mx-auto pb-[80px]">

    <div className="flex flex-col">

      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 px-6 text-center">

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

          <p className="text-base font-semibold">
            You're all caught up
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Follow people to see activity here.
          </p>

        </div>
      )}

      {notifications.map((n) => {

        const sender = senders[n.actor_id]

        const action = (() => {

          switch (n.type) {

            case 'follow':
              return 'started following you.'

            case 'answer':
              return 'answered your question.'

            case 'answer_like':
              return 'liked your answer.'

            case 'answer_reply':
              return 'replied to your answer.'

            case 'reply_like':
              return 'liked your reply.'

            case 'question_like':
              return 'liked your question.'

            case 'question_save':
              return 'saved your question.'

            case 'reply_reply':
              return 'replied to your reply.'

            case 'admin_notification':
              return n.message

            default:
              return n.message
          }

        })()

        return (

          <div
            key={n.id}
            onClick={() => handleClick(n)}
            className={`
              flex
              gap-3
              px-4
              py-4
              border-b
              border-gray-100
              cursor-pointer
              transition
              active:scale-[0.985]
              ${n.is_read ? 'bg-white' : 'bg-blue-50'}
            `}
          >

            <img
              src={sender?.avatar_url || '/default-avatar.png'}
              className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            />

            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-1 flex-wrap">

                <span className="font-semibold text-[14px] text-gray-900">
                  @{sender?.username || 'user'}
                </span>

                {sender?.is_verified && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#1D9BF0"
                      d="M12 2.5L13.8 4.2L16.2 3.8L17 6.2L19.4 7L19 9.4L20.5 11.5L19 13.6L19.4 16L17 16.8L16.2 19.2L13.8 18.8L12 20.5L10.2 18.8L7.8 19.2L7 16.8L4.6 16L5 13.6L3.5 11.5L5 9.4L4.6 7L7 6.2L7.8 3.8L10.2 4.2Z"
                    />
                    <path
                      d="M8.6 11.7l2.4 2.4 4.8-4.8"
                      fill="none"
                      stroke="#FFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}

                <span className="text-[14px] text-gray-600">
                  {action}
                </span>

              </div>

              {![
                'follow',
                'admin_notification',
              ].includes(n.type) && (
                <div
                  className="
                    mt-1
                    text-[13px]
                    italic
                    text-gray-500
                    line-clamp-2
                  "
                >
                  "{n.message}"
                </div>
              )}

              <div
                className="
                  mt-2
                  text-[12px]
                  text-gray-400
                "
              >
                {formatTime(n.created_at)}
              </div>

            </div>

          </div>

        )

      })}

    </div>

  </div>
)}