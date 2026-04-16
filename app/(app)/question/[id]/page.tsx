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

  // ===============================
  // LOAD QUESTION + ANSWERS
  // ===============================
  useEffect(() => {
    let channel: any

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setMe(user?.id || null)

      const { data: q } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', id)
        .single()

      setQuestion(q)

      const { data: a } = await supabase
        .from('answers')
        .select('id, text, user_id, question_id, approved')
        .eq('question_id', id)
        .order('created_at', { ascending: true })

      setAnswers(a || [])

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
  // ❌ removed limit restriction
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

  const { error } = await supabase
  .from('answers')
  .insert({
    text,
    user_id: user.id,
    question_id: id,
  })

// 🔔 PUSH VIA API (SERVER SAFE)
if (!error && question && question.user_id !== user.id) {
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
}
  if (error) {
    setAnswers(prev =>
      prev.filter(a => a.id !== optimisticAnswer.id)
    )
  }

  setPosting(false)
}

  // ===============================
  // SAFE RENDER
  // ===============================
  if (!question) {
    return (
      <div
        style={{
          padding: 20,
          maxWidth: 680,
          margin: '0 auto',
        }}
      >
        <p style={{ opacity: 0.6 }}>Loading…</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 16px 20px' }}>
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          width: '100%',
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
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {orderedAnswers.map(a => (
            <AnswerCard
              key={a.id}
              answer={a}
              isAsker={question.user_id === me}
            />
          ))}
        </div>

        {/* INPUT SECTION */}
        {!isClosed && (
          <div style={{ marginTop: 2 }}>
            <textarea
              value={text}
              disabled={posting}
              onChange={e => setText(e.target.value)}
              placeholder="Write your answer..."
              style={{
                width: '100%',
                minHeight: 110,
                padding: '16px 18px',
                borderRadius: 16,
                border: '1px solid #E5E7EB',
                fontSize: 16,
                lineHeight: 1.6,
                resize: 'vertical',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />

            <div
              style={{
                display: 'flex',
                gap: 14,
                marginTop: 16,
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >

              <button
                onClick={submitAnswer}
                disabled={posting}
                style={{
                  padding: '12px 24px',
                  borderRadius: 999,
                  border: 'none',
                  background: '#F4B860',
                  color: '#111827',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: posting ? 'not-allowed' : 'pointer',
                  opacity: posting ? 0.7 : 1,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                }}
              >
                {posting ? 'Posting…' : 'Answer'}
              </button>

              <button
                onClick={() => router.back()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 15,
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>

            </div>
          </div>
        )}

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

  {/* 🔥 DIVIDER */}
  <div
    style={{
      height: 1,
      background: 'linear-gradient(to right, transparent, #E5E7EB, transparent)',
      marginBottom: 12,
      opacity: 0.6,
    }}
  />

  {/* 🔥 FEEDBACK TEXT */}
  <div
    style={{
      fontSize: 12,
      color: '#6B7280',
      textAlign: 'center',
    }}
  >
    Help us improve ✨{' '}
    <span
      onClick={() => router.push('/feedback')}
      style={{
        fontWeight: 600,
        color: '#111827',
        cursor: 'pointer',
      }}
    >
      Feedback
    </span>
  </div>

</div>

      </div>
    </div>
  )
}