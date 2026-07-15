'use client'

import { useEffect, useState } from 'react'
import { useNavigation } from '@/components/navigation/NavigationProvider'
import { supabase } from '../lib/supabase'
import QuestionActionsMenu from '@/components/QuestionActionsMenu'
import ReplyCard from '@/components/ReplyCard'
import AnimatedCounter from '@/components/AnimatedCounter'

type Answer = {
  id: string
  text: string
  user_id: string
  approved: boolean
  created_at?: string
  avatar_url?: string
  username?: string
  user_name?: string
  is_verified?: boolean
  like_count?: number
  liked_by_me?: boolean

  replies?: Reply[]
  reply_count?: number
}

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
  answer: Answer
  isAsker: boolean
  isLast?: boolean

  currentUserId?: string | null
  questionId?: string

  onDelete?: (answerId: string) => void

  onReply?: (
    answerId: string,
    username: string
  ) => void
}

// ===============================
// TIME FORMAT
// ===============================
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

export default function AnswerCard({
  answer,
  isAsker,
  isLast,
  currentUserId,
  questionId,
  onDelete,
  onReply,
}: Props) {
 const [liked, setLiked] = useState(
  answer.liked_by_me ?? false
)

const [likeCount, setLikeCount] = useState(
  answer.like_count ?? 0
)
  const [approved, setApproved] = useState(answer.approved)
  const [animateLike, setAnimateLike] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const isLongAnswer = answer.text.length > 320
  const [showMenu, setShowMenu] =
  useState(false)
  const { replace } = useNavigation()
  const [replies, setReplies] =
  useState<Reply[]>([])

const [showReplies, setShowReplies] =
  useState(false)

const [loadedReplies, setLoadedReplies] =
  useState(false)

const [loadingReplies, setLoadingReplies] =
  useState(false)

const [myProfile, setMyProfile] =
  useState<CurrentUserProfile | null>(null)

  useEffect(() => {
  if (answer.replies) {
    setReplies(answer.replies)
  }
}, [answer.replies])

  useEffect(() => {
  if (!showMenu) return

  let ticking = false

  const closeMenu = () => {
    if (ticking) return

    ticking = true

    requestAnimationFrame(() => {
      setShowMenu(false)
      ticking = false
    })
  }

  window.addEventListener(
    'scroll',
    closeMenu,
    true
  )

  return () => {
    window.removeEventListener(
      'scroll',
      closeMenu,
      true
    )
  }
}, [showMenu])

useEffect(() => {
  if (!showMenu) return

  const close = () => setShowMenu(false)

  document.addEventListener('click', close)

  return () => {
    document.removeEventListener('click', close)
  }
}, [showMenu])

  // ===============================
  // SYNC APPROVAL STATE
  // ===============================

  useEffect(() => {
    setApproved(answer.approved)
  }, [answer.approved])

  useEffect(() => {
  setLikeCount(answer.like_count ?? 0)
}, [answer.like_count])

useEffect(() => {
  setLiked(answer.liked_by_me ?? false)
}, [answer.liked_by_me])

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

// ===============================
// LIKE & DISLIKE
// ===============================
const like = async () => {

  if (navigator.vibrate) {
  navigator.vibrate(12)
}

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  if (!user) return

  // Check current DB state
  const { data: existing } = await supabase
    .from('answer_likes')
    .select('id')
    .eq('answer_id', answer.id)
    .eq('user_id', user.id)
    .maybeSingle()

  // ================= UNLIKE =================
  if (existing) {
    // optimistic UI
    setLiked(false)
    setLikeCount((c: number) => Math.max(0, c - 1))

    const { error } = await supabase
      .from('answer_likes')
      .delete()
      .eq('id', existing.id)

    if (error) {
      // rollback
      setLiked(true)
      setLikeCount((c: number) => c + 1)
    }

    return
  }

  // ================= LIKE =================
  setLiked(true)
  setLikeCount((c: number) => c + 1)

  const { error } = await supabase
    .from('answer_likes')
    .insert({
      answer_id: answer.id,
      user_id: user.id,
    })

   if (answer.user_id !== user.id) {
  await supabase
    .from('notifications')
    .insert({
      user_id: answer.user_id,
      actor_id: user.id,

      type: 'answer_like',

      answer_id: answer.id,

      message:
        answer.text.length > 80
          ? `${answer.text.slice(0, 80)}...`
          : answer.text,

      link: `/question/${questionId}`,

      is_read: false,
    })

  try {
    await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: answer.user_id,

        title: `👍 ${myProfile?.name || myProfile?.username || 'Someone'} liked your answer`,

        message:
          answer.text.length > 80
            ? `${answer.text.slice(0, 80)}...`
            : answer.text,

        url: `/question/${questionId}`,
      }),
    })
  } catch {}
}

  if (error) {
    // rollback
    setLiked(false)
    setLikeCount((c: number) => Math.max(0, c - 1))
  }
}

  // ===============================
  // APPROVE
  // ===============================
  const approve = async () => {
    if (approved || loading) return
    setLoading(true)

    await supabase.rpc('approve_answer_once', {
      p_answer_id: answer.id,
    })

    setApproved(true)
    setLoading(false)
  }

  const loadReplies = async () => {
  if (loadedReplies || loadingReplies)
    return

  {loadingReplies && (
  <div
    style={{
      marginTop: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: '#6B7280',
      fontSize: 14,
      fontWeight: 600,
    }}
  >
    <div
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        border: '2px solid #D1D5DB',
        borderTopColor: '#111827',
        animation: 'spin .8s linear infinite',
      }}
    />

    Loading replies...
  </div>
)}

  const { data } = await supabase
    .from('answer_replies')
    .select(`
      *,
      profiles (
        username,
        name,
        avatar_url,
        is_verified
      )
    `)
    .eq('answer_id', answer.id)
    .order('created_at', {
      ascending: true,
    })

  setReplies(
    (data || []).map((r: any) => ({
      ...r,

      username: r.profiles?.username,
      user_name: r.profiles?.name,
      avatar_url: r.profiles?.avatar_url,
      is_verified: r.profiles?.is_verified,

      like_count: 0,
      liked_by_me: false,
    }))
  )

  setLoadedReplies(true)
  setLoadingReplies(false)
}

 return (
  <div
    style={{
  padding: '8px 0',
  borderBottom: '1px solid #F1F5F9',
}}
  >
    <div
  style={{
    display: 'grid',
    gridTemplateColumns: '34px 1fr',
    columnGap: 12,
    alignItems: 'start',
  }}
>
      {/* AVATAR */}
<div
  style={{
    display: 'flex',
    justifyContent: 'center',
  }}
>
  <img
    onClick={() => {
      if (answer.username) {
        replace(`/u/${answer.username}`)
      }
    }}
    src={answer.avatar_url || '/default-avatar.png'}
    alt=""
    style={{
      width: 34,
      height: 34,
      borderRadius: '50%',
      objectFit: 'cover',
      cursor: 'pointer',
    }}
  />
</div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'flex-start',
          }}
        >
         <div
  onClick={() => {
    if (answer.username) {
      replace(`/u/${answer.username}`)
    }
  }}
  style={{
    cursor: 'pointer',
    width: 'fit-content',
  }}
>
  <div
  style={{
    fontWeight: 700,
    fontSize: 15,
    color: '#111827',
    lineHeight: 1.25,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }}
>
  <span>
    {answer.user_name || answer.username || 'User'}
  </span>

  {answer.is_verified && (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        transform: 'translateY(1px)',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
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
    </span>
  )}
</div>

  <div
    style={{
      fontSize: 13,
      color: '#6B7280',
      marginTop: 2,
    }}
  >
    @{answer.username || 'user'}
    {answer.created_at &&
      ` • ${formatTimeAgo(answer.created_at)}`}
  </div>
</div>

           {/* REAL MENU */}
                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <button
  data-question-menu-button
  onClick={(e) => {
    e.stopPropagation()
    setShowMenu(prev => !prev)
  }}
  style={{
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    width: 32,
    height: 32,
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
                          position:
                            'absolute',
                          top: 36,
                          right: 0,
                          zIndex: 9999,
                        }}
                      >
                        <QuestionActionsMenu
  onClose={() =>
    setShowMenu(false)
  }
  isOwner={
    answer.user_id ===
    currentUserId
  }
  answerId={answer.id}
  onDelete={() => {
    onDelete?.(answer.id)
  }}
/>
                      </div>
                    )}
                  </div>
                </div>

        {/* TEXT */}
<div
  style={{
    marginTop: 8,
    fontSize: 16,
    lineHeight: 1.65,
    color: '#111827',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',

    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',

    WebkitLineClamp:
      !expanded && isLongAnswer
        ? 6
        : 'unset',

    overflow: 'hidden',

    transition:
      'all .25s ease',
  }}
>
  {answer.text}
</div>

{isLongAnswer && (
  <button
  onClick={() => setExpanded(prev => !prev)}
  style={{
    marginTop: 6,
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: '#6B7280',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.4,
    cursor: 'pointer',
    transition: 'color .15s ease',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = '#374151'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = '#6B7280'
  }}
>
  {expanded ? 'Show less' : 'Show more'}
</button>
)}

        {/* APPROVED */}
        {approved && (
          <div
            style={{
              marginTop: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background:
                '#ECFDF5',
              color: '#16A34A',
              border:
                '1px solid #BBF7D0',
              borderRadius: 999,
              padding:
                '5px 10px',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            ✅ Approved Answer
          </div>
        )}

        {/* ACTIONS */}
        {!approved && (
          <div
            style={{
  display: 'flex',
  alignItems: 'center',
  gap: 18,

  marginTop: 12,
}}
          >

            <button
  onClick={() => {
  onReply?.(
    answer.id,
    answer.username || 'user'
  )
}}
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
    transform: animateLike ? 'scale(1.12)' : 'scale(1)',
    transition:
      'transform .18s cubic-bezier(.34,1.56,.64,1), color .18s ease',
  }}
>
  <svg
  width="18"
  height="18"
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
  style={{
    transform: animateLike ? 'rotate(-8deg)' : 'rotate(0deg)',
    transition: 'transform .18s ease',
  }}
>
  <path
    d="M10 10L13 4.8C13.3 4.2 13.8 4 14.4 4H15.4C16.3 4 17 4.7 17 5.6V10H20C20.9 10 21.6 10.8 21.4 11.7L20.4 18.2C20.2 19.1 19.5 19.8 18.6 19.8H10V10Z"
    fill={liked ? "currentColor" : "none"}
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
    fill={liked ? "currentColor" : "white"}
    stroke="currentColor"
    strokeWidth="1.8"
  />
</svg>

  <AnimatedCounter
  value={likeCount}
  fontWeight={600}
  minWidth={12}
/>
</button>

            {isAsker && (
              <button
                onClick={approve}
                disabled={loading}
                style={{
                  background:
                    '#F4B860',
                  border: 'none',
                  borderRadius: 999,
                  padding:
  '8px 16px',
                  fontWeight: 600,
                  color: '#111827',
fontSize: 14,
                  cursor:
                    loading
                      ? 'default'
                      : 'pointer',
                }}
              >
                Approve
              </button>
            )}
          </div>
        )}
       {/* REPLIES */}

{(answer.reply_count ?? 0) > 0 &&
  !showReplies && (
  <button
    onClick={async () => {
  await loadReplies()
  setShowReplies(true)
}}
    style={{
      marginTop: 14,
      border: 'none',
      background: 'transparent',
      color: '#6B7280',
      cursor: 'pointer',
      padding: 0,
      fontSize: 14,
      fontWeight: 600,
    }}
  >
    View {answer.reply_count}{' '}
{answer.reply_count === 1
  ? 'reply'
  : 'replies'}
  </button>
)}

{showReplies && replies.length > 0 && (
  <>
    <button
      onClick={() => setShowReplies(false)}
      style={{
        marginTop: 14,
        border: 'none',
        background: 'transparent',
        color: '#6B7280',
        cursor: 'pointer',
        padding: 0,
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      Hide replies
    </button>

    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 2,
          height: '100%',
          background: '#E5E7EB',
        }}
      />
    </div>

    <div>
      {replies.map((reply: Reply) => (
        <ReplyCard
          key={reply.id}
          reply={reply}
          currentUserId={currentUserId}
          onReply={(_, username) => {
            onReply?.(
              reply.answer_id,
              username
            )
          }}
          onDelete={() => {
            setReplies(prev =>
              prev.filter(r => r.id !== reply.id)
            )
          }}
        />
      ))}
    </div>
  </>
)}
      </div>
    </div>
  </div>
)
} 