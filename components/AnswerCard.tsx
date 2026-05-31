'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Answer = {
  id: string
  text: string
  user_id: string
  approved: boolean
  created_at?: string
  avatar_url?: string
  username?: string
}

type Props = {
  answer: Answer
  isAsker: boolean
  isLast?: boolean
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

export default function AnswerCard({ answer, isAsker, isLast }: Props) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [approved, setApproved] = useState(answer.approved)
  const [loading, setLoading] = useState(false)

  // ===============================
  // SYNC APPROVAL STATE
  // ===============================
  useEffect(() => {
    setApproved(answer.approved)
  }, [answer.approved])

  // ===============================
  // LOAD LIKE STATE + COUNT
  // ===============================
  useEffect(() => {
    let mounted = true

    const load = async () => {
      const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

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
  // LIKE
  // ===============================
  const like = async () => {
    if (liked) return

    const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

    if (!user) return

    setLiked(true)
    setLikeCount((c) => c + 1)

    const { error } = await supabase.from('answer_likes').insert({
      answer_id: answer.id,
      user_id: user.id,
    })

    if (error) {
      setLiked(false)
      setLikeCount((c) => Math.max(0, c - 1))
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

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        marginTop: 12,
      }}
    >
      {/* LEFT: Avatar + Thread */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 36,
        }}
      >
        <img
          src={answer.avatar_url || '/default-avatar.png'}
          alt=""
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />

        {!isLast && (
          <div
            style={{
              width: 2,
              flex: 1,
              background: '#E5E7EB',
              marginTop: 4,
            }}
          />
        )}
      </div>

      {/* RIGHT: Content */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            border: approved ? '2px solid #16a34a' : '1px solid #e5e7eb',
            background: approved ? '#f0fdf4' : '#fff',
            padding: 14,
            borderRadius: 12,
            transition: 'all 0.2s ease',
          }}
        >
          {/* USERNAME */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {answer.username || '@user'}
          </div>

          {/* TIMESTAMP */}
          {answer.created_at && (
            <div
              style={{
                fontSize: 12,
                color: '#6B7280',
                marginBottom: 6,
              }}
            >
              {formatTimeAgo(answer.created_at)}
            </div>
          )}

          {/* TEXT */}
          <p style={{ marginBottom: 10 }}>{answer.text}</p>

          {/* APPROVED */}
          {approved && (
            <strong style={{ color: '#16a34a' }}>
              ✅ Approved
            </strong>
          )}

          {/* ACTIONS */}
          {!approved && (
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}
            >
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
                  <span
                    style={{
                      fontSize: 14,
                      opacity: 0.6,
                    }}
                  >
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
      </div>
    </div>
  )
}