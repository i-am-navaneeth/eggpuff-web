'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { deductForQuestion, getEggPuffBalance } from '../../../lib/rewards'
import Skeleton from '@/components/Skeleton'
import { useNotify } from '../../../components/NotificationProvider'

type Category = {
  id: string
  label: string
}

/* 🔹 slug → readable label (fallback only) */
function slugToLabel(slug: string) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export default function AskPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { notify } = useNotify()

  const [text, setText] = useState('')
  const [hours, setHours] = useState(1)
  const [category, setCategory] = useState<string>('general')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  /* ---------------- LOAD CATEGORIES ---------------- */
  useEffect(() => {
    const load = async () => {
      setPageLoading(true)

      const { data } = await supabase
        .from('categories')
        .select('id, label')
        .order('created_at', { ascending: true })

      if (data) {
        setCategories(data)
      }

      setPageLoading(false)
    }

    load()
  }, [])

  /* ---------------- PRESELECT CATEGORY FROM QUERY ---------------- */
  useEffect(() => {
    if (categories.length === 0) return

    const param = searchParams.get('category')
    if (!param) return

    // 🔥 If All selected → treat as General
    if (param === 'all') {
      setCategory('general')
      return
    }

    // 🔥 If General explicitly
    if (param === 'general') {
      setCategory('general')
      return
    }

    // 🔥 Try matching by ID first
    const matchById = categories.find(c => c.id === param)
    if (matchById) {
      setCategory(matchById.id)
      return
    }

    // 🔥 Fallback: match by readable label
    const matchByLabel = categories.find(
      c => slugToLabel(param) === c.label
    )

    if (matchByLabel) {
      setCategory(matchByLabel.id)
      return
    }

    // If nothing matches → default to general
    setCategory('general')
  }, [searchParams, categories])

  /* ---------------- SUBMIT ---------------- */
  const submit = async () => {
    if (!text.trim()) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const balance = await getEggPuffBalance(user.id)

    if (balance <= 0) {
      notify('🥐 You have 0 EggPuffs. Buy to ask a question!')
      return
    }

    setLoading(true)

    try {
      let categoryId: string | null = null

      if (category !== 'general') {
        categoryId = category
      }

      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + hours * 60)

      const { error: insertError } = await supabase
        .from('questions')
        .insert({
          text,
          category_id: categoryId,
          user_id: user.id,
          expires_at: expiresAt.toISOString(),
        })

      if (insertError) {
        console.error('QUESTION INSERT ERROR:', insertError)
        notify('❌ Failed to post question.')
        return
      }

      await deductForQuestion(user.id)

      notify('✅ Question posted!')
      router.push('/feed')
    } catch (err) {
      console.error('SUBMIT ERROR:', err)
      notify('❌ Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <div>
      {pageLoading && (
        <div style={{ maxWidth: 600, margin: '0 auto', marginTop: 24 }}>
          <Skeleton width="40%" height={26} />

          <div style={{ marginTop: 24 }}>
            <Skeleton height={16} width={120} />
            <div style={{ marginTop: 6 }}>
              <Skeleton height={48} radius={14} />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <Skeleton height={100} radius={14} />
          </div>

          <div style={{ marginTop: 16 }}>
            <Skeleton height={16} width={140} />
            <div style={{ marginTop: 6 }}>
              <Skeleton height={48} radius={14} />
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <Skeleton width={140} height={44} radius={999} />
          </div>
        </div>
      )}

      {!pageLoading && (
        <div style={{ maxWidth: 600, margin: '0 auto', marginTop: 24 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Ask the campus 🔥
          </h2>

          <p
            style={{
              fontSize: 13,
              color: '#6B7280',
              marginBottom: 20,
            }}
          >
            Ask clearly. Get better answers.
          </p>

          {/* CATEGORY */}
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, opacity: 0.7 }}>
              Category
            </label>

            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '12px 14px',
                borderRadius: 14,
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                fontSize: 14,
                appearance: 'none',
              }}
            >
              <option value="general">
                General (all topics)
              </option>

              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* QUESTION */}
          <textarea
            placeholder="Is egg puff available in canteen?"
            value={text}
            onChange={e => setText(e.target.value)}
            style={{
              width: '100%',
              minHeight: 90,
              marginTop: 16,
              padding: 12,
              borderRadius: 14,
              border: '1px solid #E5E7EB',
              fontSize: 14,
            }}
          />

          {/* TIMER */}
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, opacity: 0.7 }}>
              My question should stay for... 
            </label>

            <select
              value={hours}
              onChange={e => setHours(Number(e.target.value))}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '12px 14px',
                borderRadius: 14,
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                fontSize: 14,
                appearance: 'none',
              }}
            >
              <option value={1}>1 hour</option>
              <option value={2}>2 hours</option>
            </select>
          </div>

          {/* ACTIONS */}
          <div
            style={{
              marginTop: 28,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <button
              onClick={submit}
              disabled={loading}
              style={{
                padding: '12px 18px',
                borderRadius: 999,
                border: 'none',
                background: '#FCD34D',
                fontWeight: 600,
                fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Posting…' : 'Ask (1 🥐)'}
            </button>

            <Link href="/feed">
              <button
                style={{
                  padding: '12px 16px',
                  borderRadius: 999,
                  background: '#F3F4F6',
                  border: 'none',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
