'use client'

import { useRouter } from 'next/navigation'

type Props = {
  q: {
    id: string
    text: string
    created_at: string
    expires_at?: string
    answers_count?: number
    category_label?: string
  }
}

/* ⏳ TIME LEFT */
function timeLeft(expiresAt?: string) {
  if (!expiresAt) return null

  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h left`
  return `${minutes}m left`
}

export default function QuestionCard({ q }: Props) {
  const router = useRouter()
  const remaining = timeLeft(q.expires_at)

  const goToQuestion = () => {
    router.push(`/question/${q.id}`)
  }

  const hasAnswers = (q.answers_count ?? 0) > 0

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToQuestion}
      onKeyDown={e => {
        if (e.key === 'Enter') goToQuestion()
      }}
      style={{
        marginBottom: 14,
        padding: 20,
        borderRadius: 16,
        border: '1px solid #E5E7EB',
        background: '#FFFFFF',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease, transform 0.1s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={(e) => {
       e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'
      }}

      onMouseDown={e => {
        e.currentTarget.style.transform = 'scale(0.98)'
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {/* QUESTION TEXT */}
      <p
        style={{
          marginBottom: 8,
          fontSize: 16,
          lineHeight: 1.6,
          fontWeight:"500",
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
          fontSize: 13,
          color: '#6B7280',
        }}
      >
        {/* LEFT: ANSWER INFO */}
        <span>
          {hasAnswers ? `${q.answers_count} answers` : 'Be the first to answer'}
        </span>

        {/* RIGHT: CATEGORY + TIMER */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
            marginTop: -6,
          }}
        >
          {q.category_label && (
  <div
    style={{
      position: 'absolute',
      top: 16,        // ⬆️ distance from top
      right: 16,      // ⬅️ distance from right
      padding: '4px 12px',
      fontSize: 11,
      borderRadius: 999,
      background: '#FEF3C7',
      color: '#92400E',
      fontWeight: 600,
    }}
  >
    {q.category_label}
  </div>
)}


          {remaining && (
            <span
              style={{
                fontWeight: 600,
                color:
                  remaining === 'Expired'
                    ? '#9CA3AF'
                    : '#B45309',
              }}
            >
              ⏳ {remaining}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
