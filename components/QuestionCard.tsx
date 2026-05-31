'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { markHelpful, markNotUseful } from '@/lib/feedPrefs'
import LinkPreviewCard from './LinkPreviewCard'
import QuestionActionsMenu from './QuestionActionsMenu'

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

 const goToQuestion = () => {
  // 🔥 BLOCK navigation while menu is open
  if (showMenu) return

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

    router.push(
      `/question/${q.id}`
    )
  }, 85)
}

  const hasAnswers =
    (q.answers_count ?? 0) > 0


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

  return (
  <div
  role="button"
  tabIndex={0}
  onClick={goToQuestion}
  onKeyDown={(e) => {
    if (e.key === 'Enter') goToQuestion()
  }}
  onMouseDown={() => setPopped(true)}
  onMouseUp={() => setPopped(false)}
  onMouseLeave={() => setPopped(false)}
  onTouchStart={() => setPopped(true)}
  onTouchEnd={() => setPopped(false)}
  style={{
    marginBottom: 0,

    padding: '16px 18px 12px',

    borderRadius: 0,

    background:
      popped
        ? 'rgba(15,20,25,0.03)'
        : q.type === 'bubble'
        ? '#F8FAFC'
        : 'transparent',

    border: 'none',

    borderBottom:
      q.type === 'bubble'
        ? '1px dashed #E5E7EB'
        : '1px solid rgba(15, 20, 25, 0.08)',

    backgroundClip: 'padding-box',

    cursor: 'default',

    position: 'relative',

    zIndex: 'auto',

    boxShadow: popped
      ? '0 2px 10px rgba(0,0,0,0.04)'
      : 'none',

    transform: popped
      ? 'scale(0.988)'
      : 'scale(1)',

    opacity: popped
      ? 0.92
      : 1,

    transition:
      'transform 0.12s ease, opacity 0.12s ease, background 0.12s ease, box-shadow 0.12s ease',

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
      router.push(`/u/${q.username}`)
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
        router.push(`/u/${q.username}`)
      }
    }}
    style={{
      fontWeight: 600,
fontSize: 14.5,
letterSpacing: '-0.15px',
      opacity: 1,

      display: 'flex',

      alignItems: 'flex-start',

      gap: 4,

      cursor: 'pointer',

      width: 'fit-content',
    }}
>
  {q.hideStreak
  ? (q.user_name || 'Anonymous')
  : (
      q.is_friend || q.user_id === currentUserId
        ? `${q.user_name || 'Anonymous'} 🔥${q.streak_count ?? 0}`
        : (q.user_name || 'Anonymous')
    )
}
  {q.is_verified && (
    <span
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
  }}
>
  <svg viewBox="0 0 24 24" width="19" height="19" style={{
      transform: 'translateY(1px)', // 🔥 vertical alignment with text baseline
    }}>

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

    <circle cx="12" cy="12" r="6.5" fill="rgba(255,255,255,0.08)" />

    <path
      d="M8.6 11.7l2.4 2.4 4.8-4.8"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
  onClick={(e) =>
    e.stopPropagation()
  }
    style={{
  position: 'fixed',

  top:
    menuButtonRef.current
      ?.getBoundingClientRect()
      .bottom! + 8,

  left:
    menuButtonRef.current
      ?.getBoundingClientRect()
      .right! - 240,

  zIndex: 999999,

  isolation: 'isolate',
}}
  >
    <QuestionActionsMenu
  onClose={() => {
    requestAnimationFrame(() => {
      setShowMenu(false)
    })
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

      {/* ACTION ROW (Hidden for now) */}
      {false &&(
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 28,
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
  }}
>
  {/* COMMENT */}
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      cursor: 'pointer',
    }}
  >
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
    </svg>
    <span>{q.answers_count ?? 0}</span>
  </div>

  {/* LIKE */}
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      cursor: 'pointer',
    }}
  >
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20.8 4.6c-1.5-1.4-3.9-1.4-5.4 0L12 8l-3.4-3.4c-1.5-1.4-3.9-1.4-5.4 0-1.6 1.5-1.6 4 0 5.5L12 21l8.8-10.9c1.6-1.5 1.6-4 0-5.5z"/>
    </svg>
    <span>0</span>
  </div>

  {/* VIEWS (FIXED CENTERED ICON) */}
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      cursor: 'pointer',
    }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
      />
      <rect x="8" y="11" width="2" height="4" fill="currentColor" />
      <rect x="11" y="9" width="2" height="6" fill="currentColor" />
      <rect x="14" y="10" width="2" height="5" fill="currentColor" />
    </svg>
    <span>0</span>
  </div>
</div>
)}

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