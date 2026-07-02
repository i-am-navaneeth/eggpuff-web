'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Feedback = {
  id: string
  type: 'issue' | 'idea'
  message: string
  created_at: string
  user_id: string
}

export default function AdminFeedbackPage() {
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
        const { data: { user } } = await supabase.auth.getUser()

if (!user) return

const { data: profile } = await supabase
  .from('profiles')
  .select('is_admin')
  .eq('id', user.id)
  .single()

if (!profile || !profile.is_admin) {
  router.replace('/feed')
  return
}
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setFeedbacks(data)
      }

      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <p style={{ padding: 20 }}>Loading…</p>

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 20 }}>📩 User Feedback</h2>

      {feedbacks.length === 0 && (
        <p style={{ opacity: 0.6 }}>No feedback yet.</p>
      )}

      {feedbacks.map((fb) => (
        <div
          key={fb.id}
          style={{
            padding: 16,
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            marginBottom: 16,
            background: '#FFFFFF',
          }}
        >
          <div
            style={{
              fontSize: 13,
              marginBottom: 8,
              opacity: 0.6,
            }}
          >
            {new Date(fb.created_at).toLocaleString()}
          </div>

          <div
            style={{
              fontWeight: 600,
              marginBottom: 6,
              textTransform: 'capitalize',
            }}
          >
            {fb.type === 'issue' ? '⚠ Issue' : '💡 Idea'}
          </div>

          <div style={{ fontSize: 14 }}>
            {fb.message}
          </div>
        </div>
      ))}
    </div>
  )
}
