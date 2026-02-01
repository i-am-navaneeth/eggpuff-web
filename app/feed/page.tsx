'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import QuestionCard from '../../components/QuestionCard'
import PromoteBanner from '../../components/PromoteBanner'
import TopBar from '../../components/TopBar'

const CAMPUS_BANNER_KEY = 'campusBannerDismissed'

export default function FeedPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [promoted, setPromoted] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCampusNote, setShowCampusNote] = useState(false)

  /* ✅ CHECK LOCALSTORAGE ON FIRST LOAD */
  useEffect(() => {
    const dismissed = localStorage.getItem(CAMPUS_BANNER_KEY)
    if (!dismissed) {
      setShowCampusNote(true)
    }
  }, [])

  useEffect(() => {
    let channel: any
    let mounted = true

    const load = async () => {
      const now = new Date().toISOString()

      const [qRes, pRes] = await Promise.all([
        supabase
          .from('questions')
          .select('*')
          .gt('expires_at', now)
          .order('created_at', { ascending: false }),

        supabase
          .from('pyp_promotions')
          .select('*')
          .gt('expires_at', now)
          .order('started_at', { ascending: false })
          .limit(1)
          .single(),
      ])

      if (!mounted) return

      setQuestions(qRes.data || [])
      setPromoted(pRes.data || null)
      setLoading(false)

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

  /* ✅ DISMISS FOREVER HANDLER */
  const dismissCampusBanner = () => {
    localStorage.setItem(CAMPUS_BANNER_KEY, 'true')
    setShowCampusNote(false)
  }

  return (
    <div style={{ padding: 20 }}>
      {/* CAMPUS NOTE */}
      {showCampusNote && (
        <div
          style={{
            position: 'relative',
            padding: '8px 16px',
            fontSize: 13,
            background: '#FFF3E0',
            color: '#111827',
            textAlign: 'center',
            boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.05)',
            borderBottom: '1px solid #FFE0B2',
          }}
        >
          <span>
            Available for{' '}
            <strong>Pydah College of Engineering, Patavala</strong> only.
            <span
              style={{
                marginLeft: 8,
                padding: '2px 8px',
                fontSize: 11,
                borderRadius: 999,
                background: '#FFE0B2',
                color: '#7A3E00',
                fontWeight: 600,
              }}
            >
              Beta
            </span>
          </span>

          <button
            onClick={dismissCampusBanner}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              fontSize: 16,
              cursor: 'pointer',
              opacity: 0.5,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {/* SPACE */}
      <div style={{ height: 12 }} />

      <TopBar />

      {loading && <p>Loading feed…</p>}

      {/* 🔥 PROMOTED (ALWAYS ON TOP) */}
      {!loading && promoted?.link && (
        <PromoteBanner link={promoted.link} />
      )}

      {/* EMPTY STATE (ONLY IF NO QUESTIONS & NO PROMO) */}
      {!loading && !promoted && questions.length === 0 && (
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <h3>No questions yet 👀</h3>
          <p>Be the first one to ask on campus.</p>

          <a href="/ask">
            <button>Ask a question 🥐</button>
          </a>
        </div>
      )}

      {/* QUESTIONS */}
      {!loading &&
        questions.map(q => (
          <QuestionCard key={q.id} q={q} />
        ))}
    </div>
  )
}
