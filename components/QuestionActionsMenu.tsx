'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useNotify } from '@/components/NotificationProvider'

type FeedbackType = 'issue' | 'idea' | null

type Props = {
  onClose: () => void

  // 🔥 QUESTION ACTIONS
  isOwner?: boolean
  questionId?: string

  onDelete?: () => void
  onReport?: () => void
}

export default function FeedbackDropdown({
  onClose,

  isOwner = false,
  questionId,

  onDelete,
  onReport,
}: Props) {
  const [type, setType] =
    useState<FeedbackType>(null)

  const [message, setMessage] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const { notify } = useNotify()

  const containerRef =
    useRef<HTMLDivElement>(null)

  // ===============================
  // OUTSIDE CLICK
  // ===============================
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        onClose()
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }
  }, [onClose])

  // ===============================
  // FEEDBACK SUBMIT
  // ===============================
  const handleSubmit = async () => {
    if (!type || !message.trim()) return

    setLoading(true)

    const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

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
      console.error(
        'Feedback insert error:',
        error
      )

      notify(
        '❌ Failed to send feedback.'
      )

      setLoading(false)
      return
    }

    notify('❤️ Thanks for the feedback!')

    setLoading(false)
    setMessage('')
    setType(null)

    onClose()
  }

  // ===============================
  // DELETE QUESTION
  // ===============================
  const handleDeleteQuestion =
  async () => {
    if (!questionId) return

    // 🔥 remove instantly from UI
    onDelete?.()

    // 🔥 close menu instantly
    onClose()

    // 🔥 async DB delete
    supabase
      .from('questions')
      .delete()
      .eq('id', questionId)
      .then(({ error }) => {
        if (error) {
          console.error(error)

          notify(
            '❌ Failed to delete question.'
          )

          return
        }

        notify('Question deleted.')
      })
  }

  // ===============================
  // REPORT QUESTION
  // ===============================
  const handleReportQuestion =
    async () => {
      const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

      if (!user || !questionId) {
        notify('⚠ Please login first.')
        return
      }

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          question_id: questionId,
        })

      if (error) {
        console.error(error)

        notify(
          '❌ Failed to report question.'
        )

        return
      }

      notify(
        '🚩 Question reported.'
      )

      onReport?.()
      onClose()
    }

  // ===============================
  // COPY LINK
  // ===============================
  const handleCopyLink = async () => {
    if (!questionId) return

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/question/${questionId}`
      )

      notify('🔗 Link copied.')
      onClose()
    } catch {
      notify('❌ Failed to copy link.')
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: 240,

        background: '#FFFFFF',

        borderRadius: 18,

        border: '1px solid #E5E7EB',

        boxShadow:
          '0 10px 30px rgba(0,0,0,0.12)',

        overflow: 'hidden',

        animation:
          'dropdownIn 0.14s ease',
      }}
    >
      {/* =============================== */}
      {/* QUESTION ACTIONS */}
      {/* =============================== */}

      {!type && (
        <>
          {/* OWNER ACTIONS */}
          {isOwner ? (
            <>
              <button
                onClick={
                  handleDeleteQuestion
                }
                style={menuButtonDanger}
              >
                <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>

  <span>Delete question</span>
</div>
              </button>

              <button
                onClick={handleCopyLink}
                style={menuButton}
              >
                <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 4" />
    <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L13 20" />
  </svg>

  <span>Copy link</span>
</div>
              </button>
            </>
          ) : (
            <>
              {/* VIEWER ACTIONS */}
              <button
                onClick={
                  handleReportQuestion
                }
                style={menuButtonDanger}
              >
                <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 3v18" />
    <path d="M5 4h10l-2 4 2 4H5" />
  </svg>

  <span>Report question</span>
</div>
              </button>

              <button
                onClick={handleCopyLink}
                style={menuButton}
              >
                <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 4" />
    <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L13 20" />
  </svg>

  <span>Copy link</span>
</div>
              </button>
            </>
          )}

        </>
      )}

      {/* ANIMATION */}
      <style jsx>{`
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: scale(0.96)
              translateY(-4px);
          }

          to {
            opacity: 1;
            transform: scale(1)
              translateY(0px);
          }
        }
      `}</style>
    </div>
  )
}

// ===============================
// STYLES
// ===============================

const menuButton: React.CSSProperties = {
  width: '100%',

  padding: '14px 16px',

  background: '#FFFFFF',

  border: 'none',

  display: 'flex',

  justifyContent: 'space-between',

  alignItems: 'center',

  fontSize: 14,

  fontWeight: 500,

  cursor: 'pointer',

  color: '#111827',
}

const menuButtonDanger: React.CSSProperties =
  {
    ...menuButton,

    color: '#DC2626',
  }