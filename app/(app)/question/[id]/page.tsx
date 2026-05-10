'use client'

import { use, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AnswerCard from '@/components/AnswerCard'

type Question = {
  id: string
  text: string
  user_id: string
  expires_at: string
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
      const [
  authRes,
  questionRes,
  answersRes,
] = await Promise.all([
  supabase.auth.getUser(),

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
            const incoming = payload.new as Answer
            if (incoming.question_id !== id) return

            setAnswers(prev => {
              const optimisticIndex = prev.findIndex(
                a =>
                  a._optimistic &&
                  a.user_id === incoming.user_id &&
                  a.text === incoming.text
              )

              if (optimisticIndex !== -1) {
                const copy = [...prev]
                copy[optimisticIndex] = incoming
                return copy
              }

              if (prev.some(a => a.id === incoming.id)) return prev
              return [...prev, incoming]
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
            const updated = payload.new as Answer

            setAnswers(prev =>
              prev.map(a =>
                a.id === updated.id ? updated : a
              )
            )
          }
        )
        .subscribe()
    }

    load()

    return () => {
      if (channel) supabase.removeChannel(channel)
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
    data: { user },
  } = await supabase.auth.getUser()

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
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 2,
        }}
      >
        {question.text}
      </h2>

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