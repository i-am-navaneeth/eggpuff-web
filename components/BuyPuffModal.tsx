'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNotify } from './NotificationProvider'
import PYPSetup from './PYPSetup'

type Step =
  | 'choose'
  | 'pay'
  | 'utr'
  | 'pending'
  | 'pyp'
  | 'pyp_setup'

type Props = {
  open: boolean
  onClose: () => void
  userId: string | null
  balance: number
}

export default function BuyPuffModal({
  open,
  onClose,
  userId,
  balance,
}: Props) {
  const [utr, setUtr] = useState('')
  const [step, setStep] = useState<Step>('choose')
  const notify = useNotify()

  /* ✅ RESET MODAL STATE ON EVERY OPEN */
  useEffect(() => {
    if (open) {
      setStep('choose')
      setUtr('')
    }
  }, [open])

  useEffect(() => {
    if (!open || !userId) return

    const checkExistingPayment = async () => {
      const { data } = await supabase
        .from('payments')
        .select('status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data?.status === 'pending') {
        setStep('pending')
      }
    }

    checkExistingPayment()
  }, [open, userId])

  if (!open) return null

  const submitUTR = async () => {
    if (!utr.trim()) {
      notify('Enter valid UTR number')
      return
    }

    if (!userId) return

    const { error } = await supabase.from('payments').insert({
      user_id: userId,
      utr,
      amount: 30,
      egg_puffs: 3,
      status: 'pending',
    })

    if (error) {
      notify('UTR already submitted or invalid')
      return
    }

    notify('Payment submitted. Waiting for approval.')
    setStep('pending')
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>EggPuff 🥐</h3>

        {/* STEP: CHOOSE */}
        {step === 'choose' && (
          <>
            <button style={primaryBtn} onClick={() => setStep('pay')}>
              Buy 🥐
            </button>

            {/* ✅ ALWAYS ENABLED (curiosity-first) */}
            <button
              style={secondaryBtn}
              onClick={() => setStep('pyp')}
            >
              ✨ Promote (PYP)
            </button>
          </>
        )}

        {/* STEP: BUY */}
        {step === 'pay' && (
          <>
            <p style={priceRow}>
              <strong>Get 5 🥐 for ₹30</strong>
              <span style={bonus}>+2 BONUS</span>
            </p>

            <p style={subText}>Scan & pay using any UPI app</p>

            <img
              src="/eggpuff.paymentQR.jpeg"
              alt="UPI QR"
              style={qr}
            />

            <button onClick={() => setStep('utr')}>
              Payment done →
            </button>
          </>
        )}

        {/* STEP: UTR */}
        {step === 'utr' && (
          <>
            <input
              placeholder="Enter UTR number"
              value={utr}
              onChange={e => setUtr(e.target.value)}
              style={input}
            />
            <button onClick={submitUTR}>Submit</button>
          </>
        )}

        {/* STEP: PYP INFO */}
        {step === 'pyp' && (
          <>
            <h4>Promote Your Profile ✨</h4>

            <p style={subText}>
              Get featured in the feed for 24 hours
            </p>

            <p style={priceRow}>
              <strong>Cost: 14 🥐</strong>
              <span style={bonus}>+24 impressions</span>
            </p>

            <button onClick={() => setStep('pyp_setup')}>
              Continue →
            </button>
          </>
        )}

        {/* STEP: PYP SETUP (FINAL GATE) */}
        {step === 'pyp_setup' && userId && (
          <>
            {balance < 14 && (
              <p style={{ color: '#B45309', fontSize: 13 }}>
                You need <b>14 🥐</b> to publish this promotion.
              </p>
            )}

            <PYPSetup
              userId={userId}
              onDone={() => {
                notify('✨ Promotion started!')
                onClose()
              }}
            />
          </>
        )}

        {/* STEP: PENDING */}
        {step === 'pending' && (
          <>
            <p>⏳ Payment under verification</p>
            <p style={subText}>You’ll get 🥐 once approved</p>
          </>
        )}

        <button onClick={onClose} style={closeBtn}>
          Close
        </button>
      </div>
    </div>
  )
}

/* ---------- styles ---------- */

const overlay = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
}

const modal = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  width: 320,
  textAlign: 'center' as const,
}

const primaryBtn = {
  width: '100%',
  padding: 12,
  borderRadius: 12,
  marginBottom: 10,
}

const secondaryBtn = {
  width: '100%',
  padding: 12,
  borderRadius: 12,
  background: '#f9fafb',
}

const priceRow = {
  display: 'flex',
  justifyContent: 'center',
  gap: 8,
  alignItems: 'center',
}

const bonus = {
  fontSize: 11,
  padding: '3px 8px',
  borderRadius: 999,
  background: '#ECFDF3',
  color: '#047857',
  fontWeight: 600,
}

const subText = {
  fontSize: 13,
  opacity: 0.7,
  marginTop: 6,
}

const qr = {
  width: 180,
  height: 180,
  borderRadius: 12,
  margin: '12px auto',
}

const input = {
  width: '100%',
  padding: 10,
  borderRadius: 10,
  border: '1px solid #ddd',
  marginBottom: 12,
}

const closeBtn = {
  marginTop: 14,
  fontSize: 12,
  background: 'transparent',
}
