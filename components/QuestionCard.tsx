'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
  }
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

export default function QuestionCard({ q }: Props) {
  const router = useRouter()
  const [popped, setPopped] = useState(false)

  const goToQuestion = () => {
    if (q.type === 'bubble') {
      setPopped(true)

      const audio = new Audio('/pop.mp3')
      audio.volume = 0.4
      audio.play().catch(() => {})

      setTimeout(() => {
        router.push(`/question/${q.id}`)
      }, 250)
    } else {
      router.push(`/question/${q.id}`)
    }
  }

  const hasAnswers = (q.answers_count ?? 0) > 0

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToQuestion}
      onKeyDown={(e) => {
        if (e.key === 'Enter') goToQuestion()
      }}
      style={{
        marginBottom: 14,
        padding: 16,
        borderRadius: 16,
        background: q.type === 'bubble' ? '#F3F4F6' : '#FFFFFF',
        border:
          q.type === 'bubble'
            ? '1px dashed #111827'
            : '1px solid #E5E7EB',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease',
        boxShadow: 'none',

        transform: popped ? 'scale(0.85)' : 'scale(1)',
        opacity: popped ? 0 : 1,

        animation:
          q.type === 'bubble'
            ? 'floatBubble 3s ease-in-out infinite'
            : undefined,
      }}
    >
      {/* HEADER */}
      <div style={{ display: 'flex', gap: 10 }}>
        
        {/* AVATAR */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            backgroundImage: `url(${q.avatar_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div style={{ flex: 1 }}>
          
          {/* NAME + MORE */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
  style={{
    fontWeight: 500,
    fontSize: 12.5,
    opacity: 0.9,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  }}
>
  {q.user_name || 'Anonymous'}
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

            {/* MORE (Hidden for now)*/}
            {false && (
            <div style={{ fontSize: 18, color: '#6B7280' }}>⋯</div>)}
          </div>

          {/* USERNAME + TIME */}
          <div
            style={{
              fontSize: 11,
opacity: 0.6,
letterSpacing: '0.2px',
              color: '#6B7280',
              marginTop: 2,
            }}
          >
            @{q.username || 'user'} • {formatTime(q.created_at)}
          </div>
        </div>
      </div>

      {/* QUESTION TEXT */}
      <p
        style={{
          marginTop: 12,
          marginBottom: 10,
          fontSize: 'clamp(16px, 1.05vw, 18px)',
          letterSpacing: '-0.2px',
          lineHeight: 1.75,
          fontWeight: 500,
          color: '#111827',
        }}
      >
        {q.text}
      </p>

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