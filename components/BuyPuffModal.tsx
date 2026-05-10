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
  const { notify } = useNotify()

  /* ---------------- RESET EVERY TIME MODAL OPENS ---------------- */
  useEffect(() => {
    if (!open) return
    setStep('choose')
    setUtr('')
  }, [open])

  

  if (!open) return null  

  /* ---------------- BUY CLICK ---------------- */
  const handleBuyClick = async () => {
  if (!userId) return

  const { data } = await supabase
    .from('payments')
    .select('status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (data?.status === 'pending') {
    setStep('pending')
    return
  }

  setStep('pay')
}


  /* ---------------- SUBMIT UTR ---------------- */
const submitUTR = async () => {
  if (utr.length !== 12) {
  notify('⚠️ UTR must be exactly 12 digits')
  return
}


  if (!userId) return

  const { error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      utr,
      amount: 9,
      egg_puffs: 5,
      status: 'pending',
    })

  if (error) {
    if (error.code === '23505') {
      notify('This UTR was already submitted.')
    } else {
      notify('Payment submission failed.')
    }
    return
  }

  notify('Payment submitted. Waiting for approval.')
  setStep('pending')
}


 return (
  <div
    style={overlay}
    onClick={() => {
      setStep('choose')
      onClose()
    }}
  >
    
    <div
      style={modal}
      onClick={e => e.stopPropagation()} // prevent close when clicking inside
    >
      <h2
  style={{
    fontSize: 22,
    fontWeight: 800,
    color: '#000000',
    letterSpacing: 0.4,
    marginBottom: 18,
  }}
>
  EggPuff
</h2>


      {/* STEP: CHOOSE */}
      {step === 'choose' && (
        <>
          <button
  onClick={handleBuyClick}
  style={{
    width: '100%',

    padding: '14px 18px',

    borderRadius: 16,

    background: '#F4B860',

color: '#121212',

border: 'none',

    fontSize: 18,

    fontWeight: 700,

    letterSpacing: '-0.2px',

    cursor: 'pointer',

    transition:
      'all 0.15s ease',

    boxShadow:
      '0 4px 14px rgba(244,184,96,0.18)',

    WebkitTapHighlightColor:
      'transparent',
  }}
>
  Buy 🥐
</button>

          <button
            style={secondaryBtn}
            onClick={() => setStep('pyp')}
          >
            ✨ Promote (PYP)
          </button>
        </>
      )}

      {/* STEP: PAY */}
      {step === 'pay' && (
        <>
          <p style={priceRow}>
            <strong>Get 5 🥐 for ₹9</strong>
            <span style={bonus}>+2 BONUS</span>
          </p>

          <p style={subText}>Scan & pay using any UPI app</p>

          <img
            src="/eggpuff.paymentQR.jpeg"
            alt="UPI QR"
            style={qr}
          />

          <button
  onClick={() => setStep('utr')}
  style={actionBtn}
>
  Payment done →
</button>
        </>
      )}

      {/* STEP: UTR */}
      {step === 'utr' && (
        <>
          <input
            placeholder="Enter 12-digit UTR number"
            value={utr}
            onChange={e => {
              const onlyDigits = e.target.value.replace(/\D/g, '')
              setUtr(onlyDigits.slice(0, 12))
            }}
            maxLength={12}
            inputMode="numeric"
            pattern="[0-9]*"
            style={input}
          />

          <button
  onClick={submitUTR}
  style={actionBtn}
>
  Submit
</button>
        </>
      )}

      {/* STEP: PYP SETUP */}
      {step === 'pyp' && userId && (
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
          <p style={subText}>
            You’ll get 🥐 once approved
          </p>
        </>
      )}

      <button
        onClick={() => {
          setStep('choose')
          onClose()
        }}
        style={closeBtn}
      >
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
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.35)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
}

const modal = {
  background: '#fff',
  borderRadius: 20,
  padding: 24,
  width: '100%',
  maxWidth: 380,
  textAlign: 'center' as const,
  boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
  transform: 'translateY(-10px)', // small lift effect
}

const actionBtn = {
  width: '100%',

  padding: '16px 18px',

  borderRadius: 20,

  border: 'none',

  background: '#F4B860',

  color: '#121212',

  fontSize: 17,

  fontWeight: 700,

  letterSpacing: '-0.2px',

  cursor: 'pointer',

  marginTop: 10,

  boxShadow:
    '0 10px 26px rgba(244,184,96,0.22)',

  transition:
    'transform 0.18s cubic-bezier(.34,1.56,.64,1)',

  WebkitTapHighlightColor:
    'transparent',
}

const secondaryBtn = {
  width: '100%',

  padding: '16px 18px',

  borderRadius: 20,

  border: 'none',

  background: '#F3F4F6',

  color: '#111827',

  fontSize: 17,

  fontWeight: 700,

  cursor: 'pointer',

  marginTop: 12,

  transition:
    'transform 0.18s cubic-bezier(.34,1.56,.64,1)',

  WebkitTapHighlightColor:
    'transparent',
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
