'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import QuestionCard from '../../components/QuestionCard'
import PromoteBanner from '../../components/PromoteBanner'
import TopBar from '../../components/TopBar'

export default function FeedPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [promoted, setPromoted] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let channel: any
    let mounted = true

    const load = async () => {
      const now = new Date().toISOString()

      // 🚀 FAST: fetch feed data in parallel
      const [qRes, pRes] = await Promise.all([
        supabase
          .from('questions')
          .select('*')
          .gt('expires_at', now)
          .order('created_at', { ascending: false }),

        supabase
          .from('promotions')
          .select('*'),
      ])

      if (!mounted) return

      setQuestions(qRes.data || [])
      setPromoted(pRes.data || [])
      setLoading(false)

      // 🔴 REALTIME — source of truth
      channel = supabase
        .channel('feed-realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'questions' },
          payload => {
            const q = payload.new
            if (new Date(q.expires_at) > new Date()) {
              setQuestions(prev => {
                if (prev.some(x => x.id === q.id)) return prev
                return [q, ...prev]
              })
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'questions' },
          payload => {
            setQuestions(prev =>
              prev.filter(q => q.id !== payload.old.id)
            )
          }
        )
        .subscribe()
    }

    load()

    return () => {
      mounted = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <TopBar />

      {loading && <p>Loading feed…</p>}

      {!loading && questions.length === 0 && (
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <h3>No questions yet 👀</h3>
          <p>Be the first one to ask on campus.</p>

          <a href="/ask">
            <button>Ask a question 🥐</button>
          </a>
        </div>
      )}

      {!loading && (
        <>
          {promoted.map(p => (
            <PromoteBanner key={p.id} userId={p.user_id} />
          ))}

          {questions.map(q => (
            <QuestionCard key={q.id} q={q} />
          ))}
        </>
      )}
    </div>
  )
}
