'use client'
import { useState } from 'react'
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
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
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

      <button
        onClick={submit}
        disabled={loading}
        style={{ marginTop: 16 }}
      >
        {loading ? 'Posting…' : 'Ask (1 🥐)'}
      </button>
    </div>
  )
}
