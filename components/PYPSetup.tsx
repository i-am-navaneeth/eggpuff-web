'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNotify } from './NotificationProvider'

type Props = {
  userId: string
  onDone: () => void
}

export default function PYPSetup({ userId, onDone }: Props) {
  const [link, setLink] = useState('')
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const notify = useNotify()

  const startPYP = async () => {
    if (loading) return

    // 1️⃣ Fetch balance (final gate only)
    const { data: balanceData } = await supabase
      .from('egg_puff_ledger')
      .select('amount')
      .eq('user_id', userId)

    const balance =
      balanceData?.reduce((sum, x) => sum + x.amount, 0) || 0

    if (balance < 14) {
      notify('You need 14 🥐 to promote your profile')
      return
    }

    if (!link.trim()) {
      notify('Please add a valid link')
      return
    }

    setLoading(true)

    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      // create PYP
      const { error: pypError } = await supabase
        .from('pyp_promotions')
        .insert({
          user_id: userId,
          link,
          caption,
          expires_at: expiresAt.toISOString(),
          impressions_limit: 24,
        })

      if (pypError) throw pypError

      // deduct 14 🥐
      const { error: ledgerError } = await supabase
        .from('egg_puff_ledger')
        .insert({
          user_id: userId,
          amount: -14,
          reason: 'pyp_start',
        })

      if (ledgerError) throw ledgerError

      notify('✨ Promotion started!')
      onDone()
    } catch (err) {
      console.error(err)
      notify('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <h3 style={{ marginBottom: 8 }}>
        Promote your profile ✨
      </h3>

      <input
        placeholder="Instagram / YouTube / Portfolio link"
        value={link}
        onChange={e => setLink(e.target.value)}
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 10,
          border: '1px solid #ddd',
          marginBottom: 8,
        }}
      />

      <input
        placeholder="Short caption (optional)"
        value={caption}
        onChange={e => setCaption(e.target.value)}
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 10,
          border: '1px solid #ddd',
          marginBottom: 12,
        }}
      />

      <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 12 }}>
        Duration: <b>24 hours</b>
        <br />
        Cost: <b>14 🥐</b>
        <br />
        Bonus: <b>+24 extra impressions</b>
      </p>

      <button
        onClick={startPYP}
        disabled={loading}
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 12,
        }}
      >
        {loading ? 'Starting…' : 'Confirm'}
      </button>
    </div>
  )
}
