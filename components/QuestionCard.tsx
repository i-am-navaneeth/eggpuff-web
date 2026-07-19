'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { markHelpful, markNotUseful } from '@/lib/feedPrefs'
import LinkPreviewCard from './LinkPreviewCard'
import QuestionActionsMenu from './QuestionActionsMenu'
import { supabase } from '@/lib/supabase'
import { useShare }
from '@/contexts/ShareContext'
import { useNavigation } from '@/components/navigation/NavigationProvider'

type Props = {
  q: {
    id: string
    text: string
    created_at: string
    expires_at?: string
    type?: 'normal' | 'bubble'
    answers_count?: number
    category_label?: string
    user_name?: string
    username?: string
    avatar_url?: string
    is_verified?: boolean
    streak_count?: number
    is_trending?: boolean
    _missed?: boolean
    hideStreak?: boolean
    is_friend?: boolean
    user_id?: string
    link_url?: string
link_title?: string
link_description?: string
link_image?: string
link_domain?: string
link_type?: string
helpful_count?: number
is_helpful?: boolean
  }
  currentUserId?: string | null

  onDelete?: (id: string) => void
}

function formatTime(dateString: string) {
  const now = new Date()
  const date = new Date(dateString)

  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`

  return `${date.getMonth() + 1}/${date.getDate()}`
}

export default function QuestionCard({
  q,
  currentUserId,
  onDelete,
}: Props){
  const router = useRouter()

const {
  setShareData,
  shareRendererRef,
} = useShare()
  
  const {
  open,
  openProfile,
  openQuestion,
} = useNavigation()
  const [popped, setPopped] = useState(false)
  const menuButtonRef =
  useRef<HTMLButtonElement>(null)
  const [showMenu, setShowMenu] =
  useState(false)

  useEffect(() => {
  return () => {
    setPopped(false)
  }
}, [])

  const [feedback, setFeedback] =
    useState<'up' | 'down' | null>(null)
  
    const [helpfulCount, setHelpfulCount] =
  useState(q.helpful_count ?? 0)

const [isHelpful, setIsHelpful] =
  useState(q.is_helpful ?? false)

const [saved, setSaved] =
  useState(false)

const [showShareMenu, setShowShareMenu] =
  useState(false)

 const goToQuestion = () => {
  // 🔥 BLOCK navigation while menu is open
  if (showMenu || showShareMenu) return

  // 🔥 prevent spam taps
  if (popped) return

  // 🔥 instant visual feedback
  setPopped(true)

  // 🔥 save scroll
  sessionStorage.setItem(
    'feed_scroll',
    String(window.scrollY)
  )

  // 🔥 cache preview
  sessionStorage.setItem(
    `question-preview-${q.id}`,
    JSON.stringify(q)
  )

  // 🔥 bubble sound
  if (q.type === 'bubble') {
    try {
      const audio = new Audio('/pop.mp3')

      audio.volume = 0.15

      setTimeout(() => {
        audio.play().catch(() => {})
      }, 0)
    } catch {}
  }

  // 🔥 slight delay for tap animation
setTimeout(() => {
  setPopped(false)

  openQuestion(q.id)
}, 85)
}

  const hasAnswers =
    (q.answers_count ?? 0) > 0

const actionStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  gap: 4,

  flex: 1,

  padding: '6px 4px',

  borderRadius: 8,

  cursor: 'pointer',

  color: '#6B7280',

  fontSize: 12,

  fontWeight: 500,

  userSelect: 'none',

  WebkitTapHighlightColor:
    'transparent',
} as const


const toggleHelpful = async (
  e: React.MouseEvent
) => {
  e.preventDefault()
  e.stopPropagation()

  if (!currentUserId) return

  const nextState = !isHelpful

  // optimistic UI
  setIsHelpful(nextState)

  setHelpfulCount(prev =>
    nextState
      ? prev + 1
      : Math.max(0, prev - 1)
  )

  try {
    if (nextState) {
      const { error } = await supabase
        .from('question_likes')
        .insert({
          question_id: q.id,
          user_id: currentUserId,
        })

      if (error) throw error

      // 🔔 Notify question owner
      if (q.user_id && q.user_id !== currentUserId) {
        const { data: me } = await supabase
          .from('profiles')
          .select('name, username')
          .eq('user_id', currentUserId)
          .single()

        await supabase
          .from('notifications')
          .insert({
            user_id: q.user_id,
            actor_id: currentUserId,

            type: 'question_like',

            message:
              q.text.length > 80
                ? `${q.text.slice(0, 80)}...`
                : q.text,

            link: `/question/${q.id}`,

            is_read: false,
          })

        try {
          await fetch('/api/push/send', {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json',
            },

            body: JSON.stringify({
              userId: q.user_id,

              title: `❤️ ${me?.name || me?.username || 'Someone'} liked your question`,

              message:
                q.text.length > 80
                  ? `${q.text.slice(0, 80)}...`
                  : q.text,

              url: `/question/${q.id}`,
            }),
          })
        } catch {}
      }

    } else {

      const { error } = await supabase
        .from('question_likes')
        .delete()
        .eq('question_id', q.id)
        .eq('user_id', currentUserId)

      if (error) throw error
    }

  } catch {

    // rollback
    setIsHelpful(!nextState)

    setHelpfulCount(prev =>
      nextState
        ? Math.max(0, prev - 1)
        : prev + 1
    )
  }
}

useEffect(() => {
  if (!showShareMenu) return

  const closeMenu = () => {
    setShowShareMenu(false)
  }

  // Close when scrolling
  window.addEventListener('scroll', closeMenu, {
    passive: true,
  })

  // Close when clicking anywhere outside
  document.addEventListener(
  'click',
  closeMenu
)

  // Close when navigating away
  window.addEventListener(
    'popstate',
    closeMenu
  )

  return () => {
    window.removeEventListener(
      'scroll',
      closeMenu
    )

    document.removeEventListener(
  'click',
  closeMenu
)

    window.removeEventListener(
      'popstate',
      closeMenu
    )
  }
}, [showShareMenu])

useEffect(() => {
  const handler = (
    e: Event
  ) => {
    const id = (
      e as CustomEvent
    ).detail

    if (id !== q.id) {
      setShowShareMenu(false)
    }
  }

  window.addEventListener(
    'ep-share-open',
    handler
  )

  return () => {
    window.removeEventListener(
      'ep-share-open',
      handler
    )
  }
}, [q.id])

useEffect(() => {
  if (showMenu) {
    
  }
}, [showMenu])

useEffect(() => {
  if (!currentUserId) return

  const loadSaved = async () => {
    const { data } = await supabase
      .from('question_saves')
      .select('id')
      .eq('question_id', q.id)
      .eq('user_id', currentUserId)
      .maybeSingle()

    setSaved(!!data)
  }

  loadSaved()
}, [q.id, currentUserId])

const toggleSave = async (
  e: React.MouseEvent
) => {
  e.preventDefault()
  e.stopPropagation()

  if (!currentUserId) return

  const next = !saved

  setSaved(next)

  try {
    if (next) {
      const { error } = await supabase
        .from('question_saves')
        .insert({
          question_id: q.id,
          user_id: currentUserId,
        })

      if (error) throw error

      // 🔔 Notify question owner
      if (q.user_id && q.user_id !== currentUserId) {
        const { data: me } = await supabase
          .from('profiles')
          .select('name, username')
          .eq('user_id', currentUserId)
          .single()

        await supabase
          .from('notifications')
          .insert({
            user_id: q.user_id,
            actor_id: currentUserId,

            type: 'question_save',

            message:
              q.text.length > 80
                ? `${q.text.slice(0, 80)}...`
                : q.text,

            link: `/question/${q.id}`,

            is_read: false,
          })

        try {
          await fetch('/api/push/send', {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json',
            },

            body: JSON.stringify({
              userId: q.user_id,

              title: `🔖 ${me?.name || me?.username || 'Someone'} saved your question`,

              message: 'Your question was saved.',

              url: `/question/${q.id}`,
            }),
          })
        } catch {}
      }

    } else {

      const { error } = await supabase
        .from('question_saves')
        .delete()
        .eq('question_id', q.id)
        .eq('user_id', currentUserId)

      if (error) throw error
    }

  } catch {
    setSaved(!next)
  }
}

const handleImageShare = async () => {

  setShareData({
    question: q.text,
    creator: q.user_name || "Anonymous",
    username: q.username || "user",
    helpfulCount,
    answersCount: q.answers_count ?? 0,
  })

  await new Promise(resolve =>
    requestAnimationFrame(() =>
      requestAnimationFrame(resolve)
    )
  )

await shareRendererRef.current?.captureShare()

}

  return (
  <div
  role="button"
  tabIndex={0}
  onClick={goToQuestion}
  onKeyDown={(e) => {
    if (e.key === 'Enter') goToQuestion()
  }}
  onPointerDown={(e) => {
  if (e.pointerType !== 'touch') {
    setPopped(true)
  }
}}

onPointerUp={() => setPopped(false)}

onPointerLeave={() => setPopped(false)}

onPointerCancel={() => setPopped(false)}
  style={{
    marginBottom: 0,

    padding: '16px 18px 12px',

    borderRadius: 0,

    border: 'none',

    backgroundColor:
  popped
    ? 'rgba(15,20,25,0.02)'
    : q.type === 'bubble'
    ? '#F8FAFC'
    : 'transparent',

boxShadow: 'none',

transform: popped
  ? 'scale(0.996)'
  : 'scale(1)',

opacity: 1,

transition:
  'transform 120ms ease, background-color 120ms ease',

    borderBottom:
      q.type === 'bubble'
        ? '1px dashed #E5E7EB'
        : '1px solid rgba(15, 20, 25, 0.08)',

    backgroundClip: 'padding-box',

    cursor: 'default',

    position: 'relative',

    zIndex: 'auto',

    animation: undefined,

    WebkitTapHighlightColor:
      'transparent',
  }}
>

      {/* HEADER */}
<div
  style={{
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  }}
>
        
        {/* AVATAR */}
<div
  onClick={(e) => {
    e.stopPropagation()

    if (q.username) {
      openProfile(q.username)
    }
  }}
  style={{
    width: 38,
height: 38,

    borderRadius: '50%',

    backgroundImage: `url(${q.avatar_url})`,

    backgroundSize: 'cover',

    backgroundPosition: 'center',

    cursor: 'pointer',

    flexShrink: 0,
  }}
/>

        <div
  style={{
    flex: 1,
    minWidth: 0,
  }}
>
          
          {/* NAME + MORE */}
          <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  }}
>
  <div
  onClick={(e) => {
    e.stopPropagation()

    if (q.username) {
      openProfile(q.username)
    }
  }}
  style={{
    fontWeight: 600,
    fontSize: 14.5,
    letterSpacing: '-0.15px',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    width: 'fit-content',
    flexWrap: 'wrap',
  }}
>
  {/* Display Name */}
  <span>
    {q.user_name || 'Anonymous'}
  </span>

  {/* Verified */}
  {q.is_verified && (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          d="
            M12 2.5
            L13.8 4.2 L16.2 3.8 L17 6.2 L19.4 7 L19 9.4
            L20.5 11.5 L19 13.6 L19.4 16 L17 16.8
            L16.2 19.2 L13.8 18.8 L12 20.5
            L10.2 18.8 L7.8 19.2 L7 16.8 L4.6 16
            L5 13.6 L3.5 11.5 L5 9.4
            L4.6 7 L7 6.2 L7.8 3.8 L10.2 4.2 Z
          "
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

  {/* Streak */}
  {!q.hideStreak &&
    (q.is_friend || q.user_id === currentUserId) && (
      <span
  style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    width: 28,
    height: 28,
    flexShrink: 0,
    transform: "translateY(-4px)",
  }}
>
  <svg
    width="28"
    height="28"
    viewBox="0 0 64 64"
    fill="none"
  >
    {/* Sparkles */}
    <circle cx="9" cy="14" r="2.5" fill="#FFD54A" />
    <circle cx="55" cy="15" r="2.5" fill="#FFD54A" />
    <circle cx="12" cy="50" r="2.2" fill="#FFD54A" />
    <circle cx="52" cy="48" r="2.2" fill="#FFD54A" />

    {/* Flame */}
    <path
      d="M32 4
         C42 12 49 22 49 33
         C49 47 41 58 32 58
         C21 58 13 48 13 35
         C13 25 19 18 25 12
         C25 22 32 24 32 4Z"
      fill="#FF7A1A"
    />

    {/* Inner Flame */}
    <path
      d="M32 16
         C38 22 42 28 42 35
         C42 43 37 50 32 50
         C26 50 22 44 22 37
         C22 31 25 27 29 23
         C29 29 32 31 32 16Z"
      fill="#FFC547"
    />

    {/* White Badge */}
    <circle
      cx="32"
      cy="39"
      r="10.5"
      fill="#FFF"
    />

    {/* Orange Border */}
    <circle
      cx="32"
      cy="39"
      r="9.5"
      fill="none"
      stroke="#FF8A24"
      strokeWidth="2"
    />

    {/* Number */}
    <text
      x="32"
      y="43.5"
      textAnchor="middle"
      fontSize="16"
      fontWeight="900"
      fill="#F97316"
      fontFamily="Inter, sans-serif"
    >
      {q.streak_count ?? 0}
    </text>
  </svg>
</span>
    )}
</div>
{q.is_trending && (
  <span
    style={{
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      gap: 6,
      padding: '3px 10px',
      borderRadius: 999,
      fontSize: 10,
      fontWeight: 600,
      background: 'linear-gradient(135deg, #FFF4E5, #FFE7CC)',
      color: '#D97706',
      border: '1px solid #FCD9A8',
      width: 'fit-content',
      marginTop: 6,
    }}
  >
    🔥 Trending
  </span>
)}

{q._missed && (
  <div
    style={{
      fontSize: 12,
      fontWeight: 600,
      color: '#F59E0B',
      marginBottom: 6,
    }}
  >
    You might’ve missed this 👇
  </div>
)}


            <div
  onClick={(e) => {
  e.preventDefault()
  e.stopPropagation()
}}
  style={{
  position: 'relative',
}}
>
  <button
  data-question-menu-button
  ref={menuButtonRef}
  onMouseDown={(e) => {
    e.preventDefault()
    e.stopPropagation()
  }}

onClick={(e) => {
  e.preventDefault()
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

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

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

  {/* DROPDOWN */}
{showMenu && (
  <div
    data-question-dropdown
    onClick={(e) => e.stopPropagation()}
    style={{
      position: 'absolute',
      top: 34,
      right: 0,

      zIndex: 999999,

      minWidth: 240,
    }}
  >
    <QuestionActionsMenu
      onClose={() => {
        setShowMenu(false)
      }}
      isOwner={
        q.user_id === currentUserId
      }
      questionId={q.id}
      onDelete={() => {
        onDelete?.(q.id)
      }}
    />
  </div>
)}
</div>
          </div>

          {/* USERNAME + TIME */}
<div
  style={{
  fontSize: 12.5,

  opacity: 1,

  letterSpacing: '-0.1px',

  color: '#71767B',

  marginTop: -8,

  lineHeight: 1.2,

  display: 'flex',

  alignItems: 'center',

  gap: 3,
}}
>
  @{q.username || 'user'} •{' '}
  {formatTime(q.created_at)}
</div>
</div></div>

{/* QUESTION CONTENT */}
<div
  onClick={(e) => {
    e.stopPropagation()
    goToQuestion()
  }}
  style={{
    cursor: 'pointer',
    maxWidth: '94%',
  }}
>
<p
  style={{
    marginTop: 12,

    marginBottom:
      q.link_url ? 8 : 10,

    fontSize: '17px',

    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI Emoji", "Apple Color Emoji", sans-serif',

    letterSpacing: '-0.15px',

    lineHeight: 1.82,

    fontWeight: 400,

    color: '#0F1419',

    whiteSpace: 'pre-wrap',

    wordBreak: 'break-word',

    overflowWrap: 'break-word',
  }}
>
{(
  q.text || ''
)
  .replace(
    /\bhttps?:\/\/https?:\/\//gi,
    'https://'
  )
  .split(
    /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/
  )
    .map((part, index) => {

      const isLink =
        /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(
          part
        )

      if (isLink) {

        const href =
          part.startsWith('http')
            ? part
            : `https://${part}`

        const domain =
          (() => {
            try {
              return new URL(href)
                .hostname
                .replace(/^www\./, '')
            } catch {
              return 'Website'
            }
          })()

        // 🔥 PREMIUM CLEAN URL
        const displayText =
  part
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '')

        return (
          <span
            key={index}

            onClick={(e) => {

              e.stopPropagation()

              sessionStorage.setItem(
                'ep_inapp_browser',
                href
              )

              router.push(
                `/browser?url=${encodeURIComponent(
                  href
                )}&domain=${encodeURIComponent(
                  domain
                )}`
              )
            }}

            style={{
              color: '#1D9BF0',

              cursor: 'pointer',

              wordBreak: 'break-all',

              textDecoration: 'none',

              transition:
                'opacity 0.12s ease',
            }}

            onTouchStart={(e) => {
              e.currentTarget.style.opacity =
                '0.7'
            }}

            onTouchEnd={(e) => {
              e.currentTarget.style.opacity =
                '1'
            }}
          >
            {displayText}
          </span>
        )
      }

      return (
        <span key={index}>
          {part}
        </span>
      )
    })}
</p>
</div>

{/* 🔥 RICH PREVIEW */}
{q.link_url && (
  <div
    onClick={(e) => {
      e.stopPropagation()
    }}
    style={{
      cursor: 'pointer',
    }}
  >
    <LinkPreviewCard
      url={q.link_url}
      title={q.link_title}
      description={q.link_description}
      image={q.link_image}
      domain={q.link_domain}
      type={q.link_type}
    />
  </div>
)}

      {/* ACTION ROW */}
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: 6,

    width: '100%',

    color: '#6B7280',
  }}
>
  {/* ANSWERS */}
  <div
    onClick={(e) => {
  e.preventDefault()
  e.stopPropagation()

  goToQuestion()
}}
    style={actionStyle}
  >
    <svg
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M21 15a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z" />
</svg>

    <span>
      {q.answers_count
        ? `${q.answers_count}`
        : 'Answer'}
    </span>
  </div>

  {/* HELPFUL */}
<div
  onClick={toggleHelpful}
  style={{
    ...actionStyle,
  }}
>
<svg
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill={
    isHelpful
      ? '#FF2D7A'
      : 'none'
  }
  stroke={
    isHelpful
      ? '#FF2D7A'
      : 'currentColor'
  }
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
</svg>

  <span
    style={{
      color: '#6B7280',
    }}
  >
    {helpfulCount > 0
      ? `${helpfulCount}`
      : 'Helpful'}
  </span>
</div>

  {/* SAVE */}
<div
  onClick={toggleSave}
  style={{
    ...actionStyle,
  }}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={
      saved
        ? 'currentColor'
        : 'none'
    }
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
  </svg>

  <span>Save</span>
</div>

  {/* SHARE */}
<div
 onPointerDown={(e) => {
  e.stopPropagation()
}}

onClick={(e) => {
  e.stopPropagation()

  const next = !showShareMenu

  if (next) {
    window.dispatchEvent(
      new CustomEvent('ep-share-open', {
        detail: q.id,
      })
    )
  }

  setShowShareMenu(next)
}}
  style={{
    ...actionStyle,
    position: 'relative',
  }}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
    <path d="M12 16V3" />
    <path d="M7 8l5-5 5 5" />
  </svg>

  <span>Share</span>

  {showShareMenu && (
    <div
  onPointerDown={(e) => {
    e.stopPropagation()
  }}
  onClick={(e) => {
    e.stopPropagation()
  }}
     style={{
  position: 'absolute',

  bottom: 42,

  right: -10,

  minWidth: 220,

  background: '#fff',

  borderRadius: 16,

  whiteSpace: 'nowrap',

  boxShadow:
    '0 8px 24px rgba(0,0,0,0.10)',

  border:
    '1px solid rgba(0,0,0,0.06)',

  zIndex: 999999,
}}
    >
      {/* SHARE IMAGE */}
      <div
        onClick={async (e) => {
          e.stopPropagation()

          setShowShareMenu(false)

          setShareData({
  question: q.text,
  creator:
    q.user_name || 'Anonymous',
  username:
    q.username || 'user',
  helpfulCount,
  answersCount:
    q.answers_count ?? 0,
})

requestAnimationFrame(async () => {
  await handleImageShare()
})
        }}
        style={{
          padding:
            '14px 16px',

          cursor: 'pointer',

          display: 'flex',

          alignItems: 'center',

          gap: 12,

          fontSize: 15,

          fontWeight: 500,
        }}
      >
        <svg
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <rect x="4" y="5" width="16" height="14" rx="3" />
  <path d="M12 15V8" />
  <path d="M9 11l3-3 3 3" />
</svg>

<span>Share as image</span>
      </div>

      {/* COPY LINK */}
      <div
        onClick={async (e) => {
          e.stopPropagation()

          await navigator.clipboard.writeText(
            `${window.location.origin}/question/${q.id}`
          )

          setShowShareMenu(false)
        }}
        style={{
          padding:
            '14px 16px',

          cursor: 'pointer',

          display: 'flex',

          alignItems: 'center',

          gap: 12,

          fontSize: 15,

          fontWeight: 500,
        }}
      >
        <svg
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M10 13a4 4 0 0 1 0-6l2-2a4 4 0 1 1 6 6l-1 1" />
  <path d="M14 11a4 4 0 0 1 0 6l-2 2a4 4 0 1 1-6-6l1-1" />
</svg>

<span>Copy link</span>
      </div>

      {/* MORE OPTIONS */}
      <div
        onClick={async (e) => {
          e.stopPropagation()

          try {
            await navigator.share({
              title:
                'EggPuff',

              text:
                q.text,

              url:
                `${window.location.origin}/question/${q.id}`,
            })
          } catch {}

          setShowShareMenu(false)
        }}
        style={{
          padding:
            '14px 16px',

          cursor: 'pointer',

          display: 'flex',

          alignItems: 'center',

          gap: 12,

          fontSize: 15,

          fontWeight: 500,
        }}
      >
        <svg
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <circle cx="12" cy="5" r="1.8" />
  <circle cx="12" cy="12" r="1.8" />
  <circle cx="12" cy="19" r="1.8" />
</svg>

<span>More options</span>
      </div>
    </div>
  )}
</div>
</div>

      {/* 🫧 BUBBLE LABEL */}
{q.type === 'bubble' && (
  <div
    style={{
      position: 'absolute',
      bottom: 12,
      right: 14,
      fontSize: 11,
      color: '#92400E',
      background: '#FEF3C7',
      padding: '4px 10px',
      borderRadius: 999,
      fontWeight: 600,
    }}
  >
    🫧 Expires in 24h
  </div>
)}

{q._missed && (
  <div style={{ marginTop: 8 }}>
    {feedback === null ? (
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={(e) => {
           e.stopPropagation()
           setFeedback('up')
           markHelpful(q)
          }}
          style={{
            padding: '4px 10px',
            borderRadius: 8,
            border: '1px solid #e5e5e5',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          👍 Helpful
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setFeedback('down')
            markNotUseful(q)
          }}
          style={{
            padding: '4px 10px',
            borderRadius: 8,
            border: '1px solid #e5e5e5',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          👎 Not useful
        </button>
      </div>
    ) : (
      <div
        style={{
          fontSize: 12,
          color: '#6B7280',
          fontWeight: 500,
        }}
      >
        Thanks for your feedback 🙌
      </div>
    )}
  </div>
)}

<div
  style={{
    position: 'fixed',

    left: -99999,

    top: 0,

    pointerEvents:
      'none',
  }}
>
</div>

      {/* FLOAT */}
      <style jsx>{`
        @keyframes floatBubble {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  )
}