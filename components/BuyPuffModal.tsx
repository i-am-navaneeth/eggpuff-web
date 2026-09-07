'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { useNotify } from './NotificationProvider'

type Step =
  | 'choose'
  | 'pay'
  | 'utr'
  | 'pending'

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

  const router = useRouter()


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
    {/* ================= RESOURCES — PRIMARY ================= */}

    <button
      type="button"
      onClick={() => {
        onClose()
        router.push('/resources')
      }}
      style={{
        width: '100%',
        height: 50,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        padding: '0 18px',

        borderRadius: 14,
        border: 'none',

        background: '#F4B860',
        color: '#121212',

        fontSize: 16,
        fontWeight: 700,

        cursor: 'pointer',

        boxShadow:
          '0 6px 16px rgba(244, 184, 96, 0.18)',

        WebkitTapHighlightColor:
          'transparent',
      }}
    >
      📚 Resources
    </button>

    {/* ================= PROMOTE — SECONDARY ================= */}

    <button
      type="button"
      onClick={() => {
        onClose()
        router.push('/pyp')
      }}
      style={{
        width: '100%',
        height: 50,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        padding: '0 18px',

        marginTop: 10,

        borderRadius: 14,
        border: 'none',

        background: '#F3F4F6',
        color: '#111827',

        fontSize: 16,
        fontWeight: 700,

        cursor: 'pointer',

        WebkitTapHighlightColor:
          'transparent',
      }}
    >
      ✨ Promote Your Profile
    </button>

    {/* ================= BUY — TERTIARY ================= */}

    <button
      type="button"
      onClick={handleBuyClick}
      style={{
        width: '100%',
        height: 50,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        padding: '0 18px',

        marginTop: 10,

        borderRadius: 14,

        border:
          '1px solid #E5E7EB',

        background: '#FFFFFF',
        color: '#111827',

        fontSize: 16,
        fontWeight: 700,

        cursor: 'pointer',

        WebkitTapHighlightColor:
          'transparent',
      }}
    >
      Buy 🥐
    </button>
  </>
)}

      {/* STEP: PAY */}
{step === 'pay' && (
  <div
    style={{
      padding: '4px 0 2px',
    }}
  >
    <p
      style={{
        fontSize: 16,
        fontWeight: 600,
        color: '#0F1419',
        margin: '0 0 8px',
        letterSpacing: '-0.12px',
        lineHeight: 1.55,
      }}
    >
      Get 5 🥐 for ₹9
    </p>

    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: 999,
        background: '#ECFDF3',
        color: '#047857',
        fontSize: 11,
        fontWeight: 600,
        marginBottom: 16,
      }}
    >
      +2 BONUS
    </span>

    <div
      style={{
        width: '100%',
        minHeight: 180,
        borderRadius: 18,
        background:
          'linear-gradient(145deg, #F8FAFC, #F3F4F6)',
        border: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 18px',
        boxSizing: 'border-box',
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: 15,
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 25,
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          marginBottom: 12,
        }}
      >
        🥐
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#0F1419',
          letterSpacing: '-0.12px',
          lineHeight: 1.55,
        }}
      >
        Coming Soon
      </div>

      <div
        style={{
          fontSize: 13,
          color: '#71767B',
          marginTop: 5,
          lineHeight: 1.5,
          maxWidth: 250,
        }}
      >
        Scan & pay using any UPI app
      </div>
    </div>

    <button
      disabled
      style={{
        ...actionBtn,
        opacity: 0.55,
        cursor: 'not-allowed',
        boxShadow: 'none',
      }}
    >
      Payment done →
    </button>
  </div>
)}

      {/* STEP: UTR */}
      {step === 'utr' && (
        <>
          <input
  type="text"
  name="utr-number"
  placeholder="Enter 12-digit UTR number"
  value={utr}
  onChange={(e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '')
    setUtr(onlyDigits.slice(0, 12))
  }}
  maxLength={12}
  inputMode="numeric"
  pattern="[0-9]*"
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="off"
  spellCheck={false}
  enterKeyHint="done"
  data-form-type="other"
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
