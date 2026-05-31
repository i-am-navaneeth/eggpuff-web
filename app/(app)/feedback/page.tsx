'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useNotify } from '@/components/NotificationProvider'

export default function FeedbackPage() {
  const router = useRouter()
  const { notify } = useNotify()

  const [type, setType] = useState<'issue' | 'idea' | 'other'>('idea')
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  /* 🚀 SUBMIT */
  const submit = async () => {
    if (!message.trim()) {
      notify('⚠️ Please write something')
      return
    }

    const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          type,
          message,
          rating,
        })

      if (error) {
        console.error(error)
        notify('❌ Failed to submit feedback')
        return
      }

      notify('🙏 Thanks! Feedback submitted')

      setMessage('')
      setRating(null)
      setType('idea')

      setTimeout(() => {
        router.back()
      }, 800)
    } catch (err) {
      console.error(err)
      notify('❌ Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        padding: '16px 14px 24px',
        maxWidth: 640,
        margin: '0 auto',
      }}
    >
      {/* HEADER */}
      <h2 style={{ fontSize: 22, fontWeight: 600 }}>
        Share your feedback 💡
      </h2>

      <p
        style={{
          fontSize: 13,
          color: '#6B7280',
          marginTop: 4,
        }}
      >
        Help us improve EggPuff for everyone
      </p>

      {/* TYPE */}
      <div style={{ marginTop: 20 }}>
        <label style={{ fontSize: 13, opacity: 0.7 }}>
          Type
        </label>

        <select
          value={type}
          onChange={e => setType(e.target.value as any)}
          style={{
            width: '100%',
            marginTop: 6,
            padding: '12px 14px',
            borderRadius: 14,
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
          }}
        >
          <option value="idea">💡 Idea</option>
          <option value="issue">⚠ Issue</option>
          <option value="other">✨ Other</option>
        </select>
      </div>

      {/* MESSAGE */}
      <textarea
        placeholder="Tell us what's on your mind..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        style={{
          width: '100%',
          minHeight: 120,
          marginTop: 16,
          padding: 12,
          borderRadius: 14,
          border: '1px solid #E5E7EB',
          fontSize: 14,
          boxSizing: 'border-box',
        }}
      />

      {/* RATING */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, opacity: 0.7 }}>
          How’s your experience?
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 8,
          }}
        >
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setRating(n)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border:
                  rating === n
                    ? '2px solid #F4B860'
                    : '1px solid #E5E7EB',
                background:
                  rating === n ? '#FEF3C7' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIONS */}
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <button
          onClick={submit}
          disabled={loading}
          style={{
            padding: '12px 18px',
            borderRadius: 999,
            border: 'none',
            background: '#F4B860',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Sending…' : 'Send Feedback'}
        </button>

        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: '#6B7280',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      </div>

      {/* FOOT NOTE */}
      <p
        style={{
          marginTop: 20,
          fontSize: 11,
          color: '#9CA3AF',
          textAlign: 'center',
        }}
      >
        We read every feedback ❤️
      </p>
    </div>
  )
}