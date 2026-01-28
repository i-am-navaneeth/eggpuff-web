'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNotify } from './NotificationProvider'

export default function BuyPuffModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [utr, setUtr] = useState('')
  const [step, setStep] = useState<'pay' | 'utr' | 'pending'>('pay')
  const notify = useNotify()

  useEffect(() => {
    if (!open) return

    const checkExistingPayment = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('payments')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data && data.status === 'pending') {
        setStep('pending')
      }
    }

    checkExistingPayment()
  }, [open])

  if (!open) return null

  const submitUTR = async () => {
    if (!utr.trim()) {
      notify('Enter valid UTR number')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from('payments').insert({
      user_id: user.id,
      utr,
      amount: 30,
      egg_puffs: 3,
      status: 'pending',
    })

    if (error) {
      notify('❌ UTR already submitted or invalid')
      return
    }

    notify('✅ Payment submitted. Waiting for approval.')
    setStep('pending')
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Buy 🥐</h3>

        {step === 'pay' && (
          <>
            <p><strong>3 🥐 = ₹30</strong></p>
            <p style={{ fontSize: 14, opacity: 0.7 }}>
              Scan & pay using any UPI app
            </p>

            <img
              src="/eggpuff.paymentQR.jpeg"
              alt="UPI QR"
              style={{
                width: 180,
                height: 180,
                borderRadius: 12,
              }}
            />

            <button onClick={() => setStep('utr')}>
              Payment done →
            </button>
          </>
        )}

        {step === 'utr' && (
          <>
            <input
              placeholder="Enter UTR number"
              value={utr}
              onChange={e => setUtr(e.target.value)}
              style={input}
            />

            <button onClick={submitUTR}>
              Submit
            </button>
          </>
        )}

        {step === 'pending' && (
          <>
            <p style={{ marginTop: 16 }}>
              ⏳ Payment under verification
            </p>
            <p style={{ fontSize: 13, opacity: 0.7 }}>
              You’ll get 🥐 once approved
            </p>
          </>
        )}

        <button onClick={onClose} style={closeBtn}>
          Close
        </button>
      </div>
    </div>
  )
}

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

const qrBox = {
  height: 180,
  background: '#f3f4f6',
  borderRadius: 12,
  margin: '12px 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const input = {
  width: '100%',
  padding: 10,
  borderRadius: 10,
  border: '1px solid #ddd',
  marginBottom: 12,
}

const closeBtn = {
  marginTop: 12,
  fontSize: 12,
  background: 'transparent',
}
