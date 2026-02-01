'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { deductForQuestion, getEggPuffBalance } from '../../lib/rewards'


export default function AskPage() {
  const [text, setText] = useState('')
  const [hours, setHours] = useState(1)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!text.trim()) return

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const balance = await getEggPuffBalance(user.id)

    if (balance <= 0) {
      alert('You need 🥐 to ask a question.')
      setLoading(false)
      return
    }

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + hours)

    // deduct 1 🥐
    await deductForQuestion(user.id)

    // create question
    await supabase.from('questions').insert({
      text,
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
    })

    window.location.href = '/feed'
  }

  return (
    <>
      {/* FULL-WIDTH APP HEADER */}
      <div
        style={{
          width: '100%',
          padding: '18px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <h2 style={{ margin: 0, lineHeight: 1.3, }}>EggPuff 🥐</h2>
      </div>

      {/* CENTERED CONTENT */}
      <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
        {/* PAGE TITLE */}
        <h2>Ask the campus 🥐</h2>

        <textarea
          placeholder="Is egg puff available in canteen?"
          value={text}
          onChange={e => setText(e.target.value)}
          style={{
            width: '100%',
            minHeight: 80,
            marginTop: 12,
            padding: 10,
            borderRadius: 12,
          }}
        />

        <div style={{ marginTop: 12 }}>
          <label>Answer window:</label>
          <select
            value={hours}
            onChange={e => setHours(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          >
            <option value={1}>1 hour</option>
            <option value={2}>2 hours</option>
          </select>
        </div>

       <div
  style={{
    marginTop: 24,
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  }}
>
  <button
    onClick={submit}
    disabled={loading}
    style={{
      padding: '10px 16px',
      borderRadius: 12,
      fontWeight: 500,
      fontSize: 14,
    }}
  >
    {loading ? 'Posting…' : 'Ask (1 🥐)'}
  </button>

  <Link href="/feed">
    <button
      style={{
        padding: '10px 14px',
        borderRadius: 12,
        background: '#f3f4f6',
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
    </>
  )
}
