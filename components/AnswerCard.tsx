'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Answer = {
  id: string
  text: string
  user_id: string
  approved: boolean
}

type Props = {
  answer: Answer
  isAsker: boolean
}

export default function AnswerCard({ answer, isAsker }: Props) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [approved, setApproved] = useState(answer.approved)
  const [loading, setLoading] = useState(false)

  // ===============================
  // SYNC APPROVAL STATE FROM DB
  // ===============================
  useEffect(() => {
    setApproved(answer.approved)
  }, [answer.approved])

  // ===============================
  // LOAD LIKE STATE + COUNT (DB = SOURCE OF TRUTH)
  // ===============================
  useEffect(() => {
    let mounted = true

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('answer_likes')
          .select('id')
          .eq('answer_id', answer.id)
          .eq('user_id', user.id)
          .maybeSingle()

        if (mounted) setLiked(!!data)
      }

      const { count } = await supabase
        .from('answer_likes')
        .select('*', { count: 'exact', head: true })
        .eq('answer_id', answer.id)

      if (mounted) setLikeCount(count || 0)
    }

    load()

    return () => {
      mounted = false
    }
  }, [answer.id])

  // ===============================
  // LIKE (ONCE PER USER)
  // ===============================
  const like = async () => {
    if (liked) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // optimistic UI
    setLiked(true)
    setLikeCount(c => c + 1)

    const { error } = await supabase.from('answer_likes').insert({
      answer_id: answer.id,
      user_id: user.id,
    })

    // rollback if failed
    if (error) {
      setLiked(false)
      setLikeCount(c => Math.max(0, c - 1))
    }
  }

  // ===============================
  // APPROVE (STRICTLY ONCE — DB FUNCTION)
  // ===============================
  const approve = async () => {
    if (approved || loading) return
    setLoading(true)

    await supabase.rpc('approve_answer_once', {
      p_answer_id: answer.id,
    })

    // UI will stay correct because DB updates `approved`
    setApproved(true)
    setLoading(false)
  }

  return (
    <div
      style={{
        border: approved ? '2px solid #16a34a' : '1px solid #e5e7eb',
        background: approved ? '#f0fdf4' : '#fff',
        padding: 14,
        marginTop: 12,
        borderRadius: 12,
        transition: 'all 0.2s ease',
      }}
    >
      <p style={{ marginBottom: 10 }}>{answer.text}</p>

      {approved && (
        <strong style={{ color: '#16a34a' }}>✅ Approved</strong>
      )}

      {!approved && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={like}
            disabled={liked}
            style={{
              border: 'none',
              background: liked ? '#111' : '#f3f4f6',
              color: liked ? '#fff' : '#111',
              borderRadius: 999,
              padding: '6px 14px',
              cursor: liked ? 'default' : 'pointer',
              fontSize: 16,
              transition: 'all 0.15s ease',
            }}
          >
            👍
          </button>

          {isAsker && (
            <>
              <span style={{ fontSize: 14, opacity: 0.6 }}>
                {likeCount} likes
              </span>

              <button
                onClick={approve}
                disabled={loading}
                style={{
                  fontSize: 14,
                  background: '#fde68a',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  cursor: loading ? 'default' : 'pointer',
                }}
              >
                Approve
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
