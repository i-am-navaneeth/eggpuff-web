'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigation } from '@/components/navigation/NavigationProvider'
import AnimatedCounter from '@/components/AnimatedCounter'
import QuestionActionsMenu from '@/components/QuestionActionsMenu'

type Reply = {
  id: string
  answer_id: string
  user_id: string
  text: string
  created_at: string

  username?: string
  user_name?: string
  avatar_url?: string
  is_verified?: boolean

  like_count?: number
  liked_by_me?: boolean
}

type CurrentUserProfile = {
  name?: string
  username?: string
}

type Props = {
  reply: Reply

  currentUserId?: string | null

  onReply?: (
    replyId: string,
    username: string
  ) => void

  onDelete?: (replyId: string) => void
}

function formatTimeAgo(dateString?: string) {
  if (!dateString) return ''

  const now = Date.now()
  const time = new Date(dateString).getTime()
  const diff = Math.floor((now - time) / 1000)

  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`

  return `${Math.floor(diff / 86400)}d`
}

export default function ReplyCard({
  reply,
  currentUserId,
  onReply,
  onDelete,
}: Props) {
  const { replace } = useNavigation()

  const [liked, setLiked] = useState(
    reply.liked_by_me ?? false
  )

  const [count, setCount] = useState(
    reply.like_count ?? 0
  )

  const [showMenu, setShowMenu] =
  useState(false)

const [myProfile, setMyProfile] =
  useState<CurrentUserProfile | null>(null)

  useEffect(() => {
    setLiked(reply.liked_by_me ?? false)
  }, [reply.liked_by_me])

  useEffect(() => {
    setCount(reply.like_count ?? 0)
  }, [reply.like_count])

  useEffect(() => {
  const loadMyProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('name, username')
      .eq('user_id', user.id)
      .single()

    setMyProfile(data)
  }

  loadMyProfile()
}, [])

  const like = async () => {
  if (navigator.vibrate) {
    navigator.vibrate(12)
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  if (!user) return

  const { data: existing } =
    await supabase
      .from('answer_reply_likes')
      .select('id')
      .eq('reply_id', reply.id)
      .eq('user_id', user.id)
      .maybeSingle()

  if (existing) {
    setLiked(false)
    setCount(c => Math.max(0, c - 1))

    const { error } = await supabase
      .from('answer_reply_likes')
      .delete()
      .eq('id', existing.id)

    if (error) {
      setLiked(true)
      setCount(c => c + 1)
    }

    return
  }

  setLiked(true)
  setCount(c => c + 1)

  const { error } = await supabase
  .from('answer_reply_likes')
  .insert({
    reply_id: reply.id,
    user_id: user.id,
  })

if (!error && reply.user_id !== user.id) {
  await supabase
    .from('notifications')
    .insert({
      user_id: reply.user_id,
      actor_id: user.id,

      type: 'reply_like',

      reply_id: reply.id,

      message:
        reply.text.length > 80
          ? `${reply.text.slice(0, 80)}...`
          : reply.text,

      link: window.location.pathname,

      is_read: false,
    })

  try {
    await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: reply.user_id,

        title: `👍 ${myProfile?.name || myProfile?.username || 'Someone'} liked your reply`,

        message:
          reply.text.length > 80
            ? `${reply.text.slice(0, 80)}...`
            : reply.text,

        url: window.location.pathname,
      }),
    })
  } catch {}
}

if (error) {
  setLiked(false)
  setCount(c => Math.max(0, c - 1))
}
}

  return (
  <div
    style={{
      position: 'relative',
      marginTop: 14,
      marginLeft: 0,
      paddingLeft: 0,
    }}
  >
    {/* Elbow */}
    <div
      style={{
        position: 'absolute',
        left: -22,
        top: 1,
        width: 22,
        height: 16,
        borderLeft: '2px solid #E5E7EB',
        borderBottom: '2px solid #E5E7EB',
        borderBottomLeftRadius: 12,
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }}
    />

    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar */}
      <img
        src={reply.avatar_url || '/default-avatar.png'}
        onClick={() => {
          if (reply.username) {
            replace(`/u/${reply.username}`)
          }
        }}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          objectFit: 'cover',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      />

      {/* Right side */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          {/* User */}
          <div
            onClick={() => {
              if (reply.username) {
                replace(`/u/${reply.username}`)
              }
            }}
            style={{
              cursor: 'pointer',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {reply.user_name}
              </span>

              {reply.is_verified && (
                <svg
                  width="16"
                  height="16"
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
            </div>

            <div
              style={{
                fontSize: 12,
                color: '#6B7280',
              }}
            >
              @{reply.username} • {formatTimeAgo(reply.created_at)}
            </div>
          </div>

          {/* Menu */}
          <div
            style={{
              position: 'relative',
            }}
          >
            <button
  data-question-menu-button
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()

    setShowMenu((prev) => !prev)
  }}
  style={{
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    width: 28,
    height: 28,
    borderRadius: '50%',
    color: '#6B7280',
  }}
>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="5" cy="12" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="19" cy="12" r="1.8" />
              </svg>
            </button>

            {showMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 32,
                  right: 0,
                  zIndex: 9999,
                }}
              >
                <QuestionActionsMenu
                  onClose={() => setShowMenu(false)}
                  isOwner={reply.user_id === currentUserId}
                  replyId={reply.id}
                  onDelete={() => {
                    onDelete?.(reply.id)
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Text */}
        <div
          style={{
            marginTop: 6,
            fontSize: 15,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {reply.text}
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginTop: 10,
          }}
        >
          <button
            onClick={() =>
              onReply?.(
                reply.id,
                reply.username || 'user'
              )
            }
            style={{
              border: 'none',
              background: 'transparent',
              color: '#6B7280',
              padding: 0,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Reply
          </button>

          <button
            onClick={like}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#6B7280',
              padding: 0,
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path
                d="M10 10L13 4.8C13.3 4.2 13.8 4 14.4 4H15.4C16.3 4 17 4.7 17 5.6V10H20C20.9 10 21.6 10.8 21.4 11.7L20.4 18.2C20.2 19.1 19.5 19.8 18.6 19.8H10V10Z"
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <rect
                x="3"
                y="10.5"
                width="4"
                height="8.5"
                rx="1"
                fill={liked ? 'currentColor' : 'white'}
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>

            <AnimatedCounter
              value={count}
              fontWeight={600}
              minWidth={12}
            />
          </button>
        </div>
      </div>
    </div>
  </div>
)}