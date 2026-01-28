'use client'

import { use, useEffect, useState, useMemo } from 'react'
import { supabase } from '../../../lib/supabase'
import AnswerCard from '../../../components/AnswerCard'

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
      const { data: { user } } = await supabase.auth.getUser()
      setMe(user?.id || null)

      const { data: q } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
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
          { event: 'INSERT', schema: 'public', table: 'answers' },
          payload => {
            const incoming = payload.new as Answer
            if (incoming.question_id !== id) return

            setAnswers(prev => {
              // replace optimistic answer if exists
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
          { event: 'UPDATE', schema: 'public', table: 'answers' },
          payload => {
            const updated = payload.new as Answer
            setAnswers(prev =>
              prev.map(a => (a.id === updated.id ? updated : a))
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
    if (answers.length >= 2) return
    if (posting) return

    const { data: { user } } = await supabase.auth.getUser()
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

    // ✅ instant UI update
    setAnswers(prev => [...prev, optimisticAnswer])
    setText('')

    const { error } = await supabase.from('answers').insert({
      text,
      user_id: user.id,
      question_id: id,
    })

    if (error) {
      // rollback optimistic
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
    return <p style={{ padding: 20 }}>Loading…</p>
  }

  return (
    <div style={{ padding: 20 }}>
      <h3>{question.text}</h3>

      <p style={{ color: '#6B7280', fontSize: 14 }}>
        Answers: {answers.length}/2
      </p>

      {orderedAnswers.map(a => (
        <AnswerCard
          key={a.id}
          answer={a}
          isAsker={question.user_id === me}
        />
      ))}

      {/* 🔒 LOCK INPUT WHEN CLOSED OR POSTING */}
      {!isClosed && answers.length < 2 && (
        <>
          <textarea
            value={text}
            disabled={posting}
            onChange={e => setText(e.target.value)}
            style={{ width: '100%', minHeight: 70 }}
          />
          <button onClick={submitAnswer} disabled={posting}>
            {posting ? 'Posting…' : 'Answer'}
          </button>
        </>
      )}

      {isClosed && (
        <p style={{ marginTop: 12, color: '#16a34a' }}>
          🔒 Question closed
        </p>
      )}
    </div>
  )
}
