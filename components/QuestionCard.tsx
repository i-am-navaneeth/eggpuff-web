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
  }
}

function formatTime(dateString: string) {
  const now = new Date()
  const date = new Date(dateString)

  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`

  return `${date.getMonth() + 1}/${date.getDate()}`
}

export default function QuestionCard({ q }: Props) {
  const router = useRouter()
  const [popped, setPopped] = useState(false)

  const goToQuestion = () => {
    if (q.type === 'bubble') {
      setPopped(true)

      // 🔊 POP SOUND
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
        padding: 20,
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

        // 💥 POP EFFECT
        transform: popped ? 'scale(0.85)' : 'scale(1)',
        opacity: popped ? 0 : 1,

        // 🫧 FLOAT EFFECT
        animation:
          q.type === 'bubble'
            ? 'floatBubble 3s ease-in-out infinite'
            : undefined,
      }}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >

      {/* 🕒 TIME TOP RIGHT */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 16,
          fontSize: 12,
          color: '#6B7280',
          fontWeight: 500,
        }}
      >
        {formatTime(q.created_at)}
      </div>

      {/* CATEGORY LABEL */}
      {q.category_label && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 16,
            padding: '4px 10px',
            fontSize: 11,
            borderRadius: 999,
            background: '#F3F4F6',
            color: '#374151',
            fontWeight: 500,
          }}
        >
          {q.category_label}
        </div>
      )}

      {/* QUESTION TEXT */}
      <p
        style={{
          marginBottom: 10,
          marginTop: q.category_label ? 24 : 0,
          fontSize: 'clamp(16px, 1.1vw, 20px)',
          lineHeight: 1.65,
          fontWeight: 500,
          color: '#111827',
        }}
      >
        {q.text}
      </p>

      {/* META ROW */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          fontSize: 'clamp(13px, 0.9vw, 15px)',
          color: '#6B7280',
        }}
      >

        {/* LEFT: ANSWERS MINIMAL */}
        <span>
          {hasAnswers ? `${q.answers_count}` : 'Be the first to answer'}
        </span>

        {/* 🫧 BUBBLE LABEL BOTTOM RIGHT */}
        {q.type === 'bubble' && (
          <span
            style={{
              position: 'absolute',
              bottom: 14,
              right: 16,
              padding: '4px 10px',
              borderRadius: 999,
              background: '#FEF3C7',
              color: '#92400E',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            🫧 Expires in 24h
          </span>
        )}
      </div>

      {/* 💫 FLOAT ANIMATION */}
      <style jsx>{`
        @keyframes floatBubble {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  )
}