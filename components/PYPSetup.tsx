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
  const { notify } = useNotify()

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
    } catch (err: any) {
    console.error('PYP START ERROR:', JSON.stringify(err, null, 2))
    notify('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

 return (
  <div
    style={{
      marginTop: 10,
    }}
  >
    <div
      style={{
        fontSize: 18,
        fontWeight: 600,

        letterSpacing: '-0.8px',

        marginBottom: 18,

        color: '#111827',
      }}
    >
      Promote Your Profile ✨
    </div>

    <input
  type="url"
  name="pyp-link"
  placeholder="Instagram / YouTube / Link"
  value={link}
  onChange={(e) =>
    setLink(e.target.value)
  }
  autoComplete="url"
  autoCorrect="off"
  autoCapitalize="none"
  spellCheck={false}
  enterKeyHint="next"
  style={{
    width: '100%',

    padding: '16px 18px',

    borderRadius: 18,

    border: '1px solid #E5E7EB',

    fontSize: 16,

    outline: 'none',

    marginBottom: 10,

    background: '#FFFFFF',

    boxSizing: 'border-box',

    transition:
      'border-color .18s ease, box-shadow .18s ease',
  }}
/>

    <input
  type="text"
  name="pyp-caption"
  placeholder="Caption (optional)"
  value={caption}
  onChange={(e) =>
    setCaption(e.target.value)
  }
  autoComplete="off"
  autoCorrect="on"
  autoCapitalize="sentences"
  spellCheck={true}
  enterKeyHint="done"
  style={{
    width: '100%',

    padding: '16px 18px',

    borderRadius: 18,

    border: '1px solid #E5E7EB',

    fontSize: 16,

    outline: 'none',

    marginBottom: 18,

    background: '#FFFFFF',

    boxSizing: 'border-box',

    transition:
      'border-color .18s ease, box-shadow .18s ease',
  }}
/>

    <div
      style={{
        textAlign: 'center',

        marginBottom: 20,

        lineHeight: 1.7,
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,

          color: '#111827',
        }}
      >
        24h • 14 🥐
      </div>

      <div
        style={{
          fontSize: 14,

          color: '#059669',

          fontWeight: 600,
        }}
      >
        +24 bonus impressions
      </div>
    </div>

    <button
      onClick={startPYP}
      disabled={loading}
      onMouseDown={(e) => {
        if (!loading) {
          e.currentTarget.style.transform =
            'scale(0.94)'
        }
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform =
          'scale(1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          'scale(1)'
      }}
      onTouchStart={(e) => {
        if (!loading) {
          e.currentTarget.style.transform =
            'scale(0.94)'
        }
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform =
          'scale(1)'
      }}
      style={{
        width: '100%',

        padding: '18px 18px',

        borderRadius: 22,

        border: 'none',

        background: loading
          ? '#FDE7BF'
          : '#F4B860',

        color: '#121212',

        fontSize: 18,

        fontWeight: 800,

        letterSpacing: '-0.3px',

        cursor: loading
          ? 'not-allowed'
          : 'pointer',

        opacity: loading ? 0.75 : 1,

        boxShadow:
          '0 10px 26px rgba(244,184,96,0.22)',

        transition:
          'transform 0.16s cubic-bezier(.34,1.56,.64,1)',

        WebkitTapHighlightColor:
          'transparent',
      }}
    >
      {loading
        ? 'Starting…'
        : 'Start Promotion'}
    </button>
  </div>
)}