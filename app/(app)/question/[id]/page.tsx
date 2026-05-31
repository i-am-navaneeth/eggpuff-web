'use client'

import { use, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AnswerCard from '@/components/AnswerCard'
import LinkPreviewCard from '@/components/LinkPreviewCard'

type Question = {
  id: string
  text: string
  user_id: string
  expires_at: string
  link_url?: string
  link_title?: string
  link_description?: string
  link_image?: string
  link_domain?: string
  link_type?: string
}

type Answer = {
  id: string
  text: string
  user_id: string
  question_id: string
  approved: boolean
  _optimistic?: boolean
}

export default function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [text, setText] = useState('')
  const [me, setMe] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)

  // ===============================
// INSTANT PREVIEW CACHE
// ===============================
useEffect(() => {
  if (!id) return

  const cached = sessionStorage.getItem(
    `question-preview-${id}`
  )

  if (cached) {
    try {
      const parsed = JSON.parse(cached)

      setQuestion(parsed)

      // 🔥 instant render
      setLoading(false)
    } catch {}
  }
}, [id])

  // ===============================
  // LOAD QUESTION + ANSWERS
  // ===============================
useEffect(() => {
  let channel: any

  const load = async () => {
    // 🔥 auth FIRST
    const authRes =
      await supabase.auth.getUser()

    // 🔥 remaining queries in parallel
    const [
      questionRes,
      answersRes,
    ] = await Promise.all([

      supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single(),

      supabase
        .from('answers')
        .select(
          'id, text, user_id, question_id, approved, created_at'
        )
        .eq('question_id', id)
        .order('created_at', {
          ascending: true,
        }),

    ])

    const user =
      authRes.data?.user

    setMe(user?.id || null)

    if (questionRes.data) {
      setQuestion((prev: any) => ({
        ...prev,
        ...questionRes.data,
      }))
    }

    setAnswers(
      answersRes.data || []
    )

    // 🔥 render everything together
    setLoading(false)

    // 🔥 realtime
    channel = supabase
      .channel('answers-' + id)

      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'answers',
        },
        payload => {
          const incoming =
            payload.new as Answer

          if (
            incoming.question_id !== id
          ) return

          setAnswers(prev => {
            const optimisticIndex =
              prev.findIndex(
                a =>
                  a._optimistic &&
                  a.user_id === incoming.user_id &&
                  a.text === incoming.text
              )

            // 🔥 replace optimistic answer
            if (
              optimisticIndex !== -1
            ) {
              const copy = [...prev]

              copy[optimisticIndex] =
                incoming

              return copy
            }

            // 🔥 prevent duplicates
            if (
              prev.some(
                a =>
                  a.id === incoming.id
              )
            ) {
              return prev
            }

            return [
              ...prev,
              incoming,
            ]
          })
        }
      )

      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'answers',
        },
        payload => {
          const updated =
            payload.new as Answer

          setAnswers(prev =>
            prev.map(a =>
              a.id === updated.id
                ? updated
                : a
            )
          )
        }
      )

      .subscribe()
  }

  load()

  return () => {
    if (channel) {
      supabase.removeChannel(
        channel
      )
    }
  }
}, [id])

  // ===============================
  // DERIVED STATE
  // ===============================
  const approvedAnswer = answers.find(a => a.approved)
  const normalAnswers = answers.filter(a => !a.approved)

  const orderedAnswers = useMemo(() => {
    return approvedAnswer
      ? [approvedAnswer, ...normalAnswers]
      : normalAnswers
  }, [approvedAnswer, normalAnswers])

  const isClosed = Boolean(approvedAnswer)

  // ===============================
  // SUBMIT ANSWER (OPTIMISTIC)
  // ===============================
 const submitAnswer = async () => {
  if (!text.trim()) return
  if (posting) return

  const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

  if (!user) return

  setPosting(true)

  const optimisticAnswer: Answer = {
    id: `temp-${Date.now()}`,
    text,
    user_id: user.id,
    question_id: id,
    approved: false,
    _optimistic: true,
  }

  setAnswers(prev => [...prev, optimisticAnswer])
  setText('')

  try {
    const { error } = await supabase
      .from('answers')
      .insert({
        text,
        user_id: user.id,
        question_id: id,
      })

    if (error) {
      setAnswers(prev =>
        prev.filter(a => a.id !== optimisticAnswer.id)
      )
      console.error('Insert error:', error)
      return
    }

    // ✅ RESET UI IMMEDIATELY
    setPosting(false)

    await supabase.rpc('update_streak', { u_id: user.id })
    
    // 🔔 PUSH (safe)
   if (question && question.user_id !== user?.id) {
  try {
    await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: question.user_id,
        title: '💬 New answer',
        message: 'New activity on your question',
        url: `/question/${id}`,
      }),
    })

    // 🔔 ALSO INSERT IN-APP NOTIFICATION
    await supabase.from('notifications').insert({
      user_id: question.user_id,
      actor_id: user?.id,
      type: 'answer',
      message: 'answered your question',
      link: `/question/${id}`,
      is_read: false,
    })

  } catch (err) {
    console.error('Push error:', err)
  }
}

  } catch (err) {
    console.error('Submit error:', err)

    // rollback optimistic
    setAnswers(prev =>
      prev.filter(a => a.id !== optimisticAnswer.id)
    )
  } finally {
    // ✅ ALWAYS RESET
    setPosting(false)
  }
}
  // ===============================
  // SAFE RENDER
  // ===============================
if (!question?.text) {
  return null
}

return (
  <div
    style={{
      padding: '55px 16px 100px',
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '100vh',
      }}
    >

      {/* QUESTION */}
<div
  style={{
    marginBottom: 4,
  }}
>
  <h2
    style={{
      fontSize: 20,

      fontWeight: 600,

      lineHeight: 1.65,

      letterSpacing: '-0.2px',

      color: '#0F1419',

      whiteSpace: 'pre-wrap',

      wordBreak: 'break-word',

      overflowWrap: 'break-word',

      fontFamily:
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI Emoji", "Apple Color Emoji", sans-serif',
    }}
  >
    {question.text
      .split(
        /(https?:\/\/[^\s]+|www\.[^\s]+)/g
      )
      .map((part, index) => {

        const isLink =
          /^(https?:\/\/|www\.)/.test(
            part
          )

        if (isLink) {

          const href =
            part.startsWith('http')
              ? part
              : `https://${part}`

          return (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation()

                sessionStorage.setItem(
                  'ep_inapp_browser',
                  href
                )

                router.push(
                  `/browser?url=${encodeURIComponent(
                    href
                  )}`
                )
              }}
              style={{
                color: '#1D9BF0',

                cursor: 'pointer',

                textDecoration: 'none',

                wordBreak: 'break-word',
              }}
            >
              {part}
            </span>
          )
        }

        return (
          <span key={index}>
            {part}
          </span>
        )
      })}
  </h2>

  {/* RICH PREVIEW */}
  {question.link_url && (
    <div
      style={{
        marginTop: 14,
      }}
    >
      <LinkPreviewCard
        url={question.link_url}
        title={question.link_title}
        description={
          question.link_description
        }
        image={question.link_image}
        domain={question.link_domain}
        type={question.link_type}
      />
    </div>
  )}
</div>

      <p
        style={{
          color: '#6B7280',
          fontSize: 14,
          marginBottom: 10,
        }}
      >
        Answers: {answers.length}
      </p>

        {/* ANSWERS */}
        <div
  style={{
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '120px', // 🔥 space for input box
  }}
>
          {orderedAnswers.map((a, i) => (
  <AnswerCard
    key={a.id}
    answer={a}
    isAsker={question.user_id === me}
    isLast={i === orderedAnswers.length - 1}
  />
))}
        </div>
{/* 🔥 DIVIDER */}
  <div
    style={{
      height: 1,
      background: 'linear-gradient(to right, transparent, #E5E7EB, transparent)',
      marginBottom: 12,
      opacity: 0.6,
    }}
  />
        <div
  style={{
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    margin: '12px 0',
  }}
>
  Love EggPuff?{' '}
  <span
    onClick={() => {
      window.location.href = '/feedback'
    }}
    style={{
      fontWeight: 600,
      color: '#111827',
      cursor: 'pointer',
    }}
  >
    Rate it ⭐
  </span>
</div>

        {/* INPUT SECTION */}
        <div
  style={{
    position: 'fixed',
    paddingBottom: 'env(safe-area-inset-bottom)',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'white',
    borderTop: '1px solid #eee',
    padding: '10px 12px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    zIndex: 20,
  }}
>
  <input
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="Write your answer..."
    style={{
      flex: 1,
      padding: '10px 12px',
      borderRadius: '20px',
      border: '1px solid #ddd',
      outline: 'none',
    }}
  />

  <button
    onClick={submitAnswer}
    disabled={posting}
    style={{
      background: '#E9B25D',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '20px',
      fontWeight: 600,
      cursor: 'pointer',
    }}
  >
    {posting ? '...' : 'Answer'}
  </button>
</div>

        {/* CLOSED STATE */}
        {isClosed && (
          <p
            style={{
              marginTop: 22,
              color: '#16a34a',
              fontWeight: 500,
            }}
          >
            🔒 Question closed
          </p>
        )}

        <div style={{ marginTop: 24 }}>

  

</div>

      </div>
    </div>
  )
}