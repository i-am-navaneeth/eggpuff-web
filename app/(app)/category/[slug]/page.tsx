'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import QuestionCard from '@/components/QuestionCard'
import TopBar from '@/components/TopBar'

export default function CategoryFeedPage() {
  const { slug } = useParams<{ slug: string }>()
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  /* 🔹 LOAD + REALTIME (EXISTING LOGIC INTACT) */
  useEffect(() => {
    if (!slug) return

    let channel: any
    let mounted = true

    const load = async () => {
      const now = new Date().toISOString()

      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('category', slug)
        .gt('expires_at', now)
        .order('created_at', { ascending: false })

      if (!mounted) return

      setQuestions(data || [])
      setLoading(false)

      channel = supabase
        .channel(`category-${slug}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'questions',
            filter: `category=eq.${slug}`,
          },
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
          {
            event: 'DELETE',
            schema: 'public',
            table: 'questions',
          },
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
  }, [slug])

  /* 🔹 NEW FEATURE: AUTO-HIDE EXPIRED QUESTIONS (NO DB DELETE NEEDED) */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setQuestions(prev =>
        prev.filter(q => new Date(q.expires_at) > now)
      )
    }, 60000) // every 1 minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <TopBar />

      <h2 style={{ marginTop: 12, marginBottom: 8 }}>
        {slug.charAt(0).toUpperCase() + slug.slice(1)}
      </h2>

      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 16 }}>
        Active questions only · Auto-disappear after time ends
      </p>

      {loading && <p>Loading…</p>}

      {!loading && questions.length === 0 && (
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <h3>No active questions 👀</h3>
          <p>Be the first to ask in this category.</p>
        </div>
      )}

      {!loading &&
        questions.map(q => (
          <QuestionCard key={q.id} q={q} />
        ))}
    </div>
  )
}
