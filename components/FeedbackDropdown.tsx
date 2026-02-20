'use client'

import { useState } from 'react'
import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useNotify } from '@/components/NotificationProvider'

type FeedbackType = 'issue' | 'idea' | null

export default function FeedbackDropdown({
  onClose,
}: {
  onClose: () => void
}) {
  const [type, setType] = useState<FeedbackType>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { notify } = useNotify()


  const handleSubmit = async () => {
  if (!type || !message.trim()) return

  setLoading(true)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notify('⚠ Please login first.')
    setLoading(false)
    return
  }

  const { error } = await supabase
    .from('feedback')
    .insert({
      user_id: user.id,
      type,
      message,
    })
    .select()

  if (error) {
    console.error('Feedback insert error:', error)
    notify('❌ Failed to send feedback.')
    setLoading(false)
    return
  }

  notify('❤️ Thanks for the feedback!')

  setLoading(false)
  setMessage('')
  setType(null)
  onClose()
}

  const containerRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      onClose()
    }
  }

  document.addEventListener('mousedown', handleClickOutside)

  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [onClose])


  return (
    <div
    ref={containerRef}
  style={{
    background: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
    border: '1px solid #E5E7EB',
  }}
    >
      {!type && (
        <>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 18,
              color: '#111827',
            }}
          >
            ❤️ Help us improve EggPuff.
          </div>

          <div
  style={{
    display: 'flex',
    gap: 12,
    flexDirection: 'column',
  }}
  className="sm:flex-row"
>
            <button
              onClick={() => setType('issue')}
              style={cardStyle}
            >
              <div style={{ fontSize: 20 }}>⚠️</div>
              <div style={{ fontWeight: 600 }}>Issue</div>
              <div style={subText}>
                I found a bug.
              </div>
            </button>

            <button
              onClick={() => setType('idea')}
              style={cardStyle}
            >
              <div style={{ fontSize: 20 }}>💡</div>
              <div style={{ fontWeight: 600 }}>Idea</div>
              <div style={subText}>
                I have a thought.
              </div>
            </button>
          </div>
        </>
      )}

      {type && (
        <>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 12,
              color: '#111827',
            }}
          >
            {type === 'issue'
              ? 'Report an Issue'
              : 'Share an Idea'}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              type === 'issue'
                ? 'Describe the issue clearly...'
                : 'Describe your idea...'
            }
            style={{
              width: '100%',
              minHeight: 100,
              padding: 12,
              marginBottom: 16,
              borderRadius: 12,
              border: '1px solid #E5E7EB',
              fontSize: 14,
              resize: 'vertical',
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: 'none',
                background: '#F4B860',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Sending…' : 'Submit'}
            </button>

            <button
              onClick={() => setType(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6B7280',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              ← Back
            </button>
          </div>
        </>
      )}

      <div
        style={{
          marginTop: 20,
          paddingTop: 14,
          borderTop: '1px solid #F3F4F6',
          fontSize: 12,
          color: '#6B7280',
          textAlign: 'center',
        }}
      >
        Want to know more?{' '}
        <Link
          href="/about"
          onClick={() => onClose()}
          style={{
            color: '#F59E0B',
            fontWeight: 500,
          }}
        >
          Visit About page
        </Link>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  flex: 1,
  padding: 16,
  borderRadius: 14,
  border: '1px solid #E5E7EB',
  background: '#FAFAFA',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  alignItems: 'center',
  textAlign: 'center',
  transition: 'all 0.15s ease',
}

const subText: React.CSSProperties = {
  fontSize: 12,
  color: '#6B7280',
}
