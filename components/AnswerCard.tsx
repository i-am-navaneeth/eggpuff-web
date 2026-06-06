'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import QuestionActionsMenu from '@/components/QuestionActionsMenu'

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

  currentUserId?: string | null
  questionId?: string
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

export default function AnswerCard({
  answer,
  isAsker,
  isLast,
  currentUserId,
  questionId,
}: Props) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [approved, setApproved] = useState(answer.approved)
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] =
  useState(false)

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
      padding: '16px 0',
      borderBottom:
        '1px solid rgba(15,20,25,0.08)',
    }}
  >
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      {/* AVATAR */}
      <img
        src={
          answer.avatar_url ||
          '/default-avatar.png'
        }
        alt=""
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: '#0F1419',
              }}
            >
              {answer.username ||
                'Anonymous'}
            </div>

            <div
              style={{
                fontSize: 13,
                color: '#71767B',
                marginTop: 2,
              }}
            >
              @
              {answer.username ||
                'user'}
              {answer.created_at &&
                ` • ${formatTimeAgo(
                  answer.created_at
                )}`}
            </div>
          </div>

           {/* REAL MENU */}
                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
          
                        setShowMenu(
                          !showMenu
                        )
                      }}
                      style={{
                        border: 'none',
                        background:
                          'transparent',
                        cursor: 'pointer',
                        width: 32,
                        height: 32,
                        borderRadius:
                          '50%',
                        color: '#6B7280',
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <circle
                          cx="5"
                          cy="12"
                          r="1.8"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="1.8"
                        />
                        <circle
                          cx="19"
                          cy="12"
                          r="1.8"
                        />
                      </svg>
                    </button>
          
                    {showMenu && (
                      <div
                        style={{
                          position:
                            'absolute',
                          top: 36,
                          right: 0,
                          zIndex: 9999,
                        }}
                      >
                        <QuestionActionsMenu
  onClose={() =>
    setShowMenu(false)
  }
  isOwner={
    answer.user_id ===
    currentUserId
  }
  questionId={
    questionId
  }
/>
                      </div>
                    )}
                  </div>
                </div>

        {/* TEXT */}
        <div
          style={{
            marginTop: 12,
            fontSize: 17,
            lineHeight: 1.8,
            color: '#0F1419',
            whiteSpace:
              'pre-wrap',
            wordBreak:
              'break-word',
          }}
        >
          {answer.text}
        </div>

        {/* APPROVED */}
        {approved && (
          <div
            style={{
              marginTop: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background:
                '#ECFDF5',
              color: '#16A34A',
              border:
                '1px solid #BBF7D0',
              borderRadius: 999,
              padding:
                '5px 10px',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            ✅ Approved Answer
          </div>
        )}

        {/* ACTIONS */}
        {!approved && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 14,
            }}
          >
            <button
              onClick={like}
              disabled={liked}
              style={{
                border: 'none',
                background:
                  liked
                    ? '#111827'
                    : '#F3F4F6',
                color:
                  liked
                    ? '#FFFFFF'
                    : '#111827',
                borderRadius: 999,
                padding:
                  '7px 14px',
                cursor: liked
                  ? 'default'
                  : 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              👍 {likeCount}
            </button>

            {isAsker && (
              <button
                onClick={approve}
                disabled={loading}
                style={{
                  background:
                    '#F4B860',
                  border: 'none',
                  borderRadius: 999,
                  padding:
                    '7px 14px',
                  fontWeight: 600,
                  cursor:
                    loading
                      ? 'default'
                      : 'pointer',
                }}
              >
                Approve
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
)
}