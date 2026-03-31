'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useNotify } from '../../../components/NotificationProvider'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [liveUsers, setLiveUsers] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)

  const [animatedLive, setAnimatedLive] = useState(0)
  const [animatedTotal, setAnimatedTotal] = useState(0)

  const [authorized, setAuthorized] = useState(false)

  const { notify } = useNotify()

  const router = useRouter()
  const [collegeRequests, setCollegeRequests] = useState<any[]>([])
  

  /* ---------------- ADMIN GUARD ---------------- */
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser()
console.log("AUTH USER ID:", data.user?.id)

      if (!data.user) {
        window.location.href = '/login'
        return
      }
      
      const { data: profile } = await supabase
  .from('profiles')
  .select('is_admin')
  .eq('id', data.user.id)
  .maybeSingle()

console.log("PROFILE FOUND:", profile)

      if (!profile || !profile.is_admin) {
  router.replace('/feed')
  return
}

      setAuthorized(true)
    }

    checkAdmin()
  }, [])

  /* ---------------- LOAD PAYMENTS ---------------- */
  const loadPayments = async () => {
    try {
      const res = await fetch('/api/admin/get-payments', {
        method: 'GET',
        cache: 'no-store',
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('LOAD PAYMENTS ERROR:', data)
        notify('❌ Failed to load payments')
        return
      }

      setPayments(data.payments || [])
    } catch (err) {
      console.error('PAYMENTS LOAD ERROR:', err)
      notify('❌ Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

const loadCollegeRequests = async () => {
  const { data, error } = await supabase
    .from('college_requests')
.select(`
  *,
  profiles:requested_by (
    email
  )
`)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  setCollegeRequests(data || [])
}

  useEffect(() => {
  if (authorized) {
    loadPayments()
    loadCollegeRequests() // 🔥 added
  }
}, [authorized])

const approveCollege = async (req: any) => {
  // 1. insert into colleges
  const { error: insertError } = await supabase
    .from('colleges')
    .insert({
      name: req.name,
    })

  if (insertError) {
    notify('❌ Failed to add college')
    return
  }

  // 2. update request status
  await supabase
    .from('college_requests')
    .update({ status: 'approved' })
    .eq('id', req.id)

  notify('🎓 College approved')

  loadCollegeRequests()
}

const rejectCollege = async (req: any) => {
  await supabase
    .from('college_requests')
    .update({ status: 'rejected' })
    .eq('id', req.id)

  notify('❌ College rejected')

  loadCollegeRequests()
}
  /* ---------------- LOAD STATS ---------------- */
  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        method: 'GET',
        cache: 'no-store',
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Stats API error:', data)
        return
      }

      setLiveUsers(data.liveUsers ?? 0)
      setTotalUsers(data.totalUsers ?? 0)
    } catch (err) {
      console.error('FETCH STATS ERROR:', err)
    }
  }

  useEffect(() => {
    if (authorized) {
      loadStats()
    }
  }, [authorized])

  /* ---------------- ANIMATE COUNTERS ---------------- */
  useEffect(() => {
    const animate = (
      setter: (v: number) => void,
      target: number
    ) => {
      if (target <= 0) {
        setter(0)
        return
      }

      let current = 0
      const duration = 700
      const frameRate = 16
      const totalFrames = duration / frameRate
      const increment = target / totalFrames

      const step = () => {
        current += increment
        if (current < target) {
          setter(Math.floor(current))
          requestAnimationFrame(step)
        } else {
          setter(target)
        }
      }

      requestAnimationFrame(step)
    }

    animate(setAnimatedLive, liveUsers)
    animate(setAnimatedTotal, totalUsers)
  }, [liveUsers, totalUsers])

  /* ---------------- APPROVE ---------------- */
  const approve = async (p: any) => {
    try {
      const { error: updateError } = await supabase
        .from('payments')
        .update({ status: 'approved' })
        .eq('id', p.id)

      if (updateError) {
        console.error(updateError)
        notify('❌ Failed to update payment')
        return
      }

      const { error: ledgerError } = await supabase
        .from('egg_puff_ledger')
        .insert({
          user_id: p.user_id,
          amount: 5,
          reason: 'Purchase approved (₹9 = 5 EP)',
        })

      if (ledgerError) {
        console.error(ledgerError)
        notify('❌ Failed to credit EP')
        return
      }

      try {
        const res = await fetch('/api/admin/send-payment-mail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: p.user_id }),
        })

        const data = await res.json()

        if (res.ok && data?.mailUrl) {
          window.open(data.mailUrl, '_blank')
        } else {
          console.error('Mail API error:', data)
        }
      } catch (mailErr) {
        console.error('MAIL ERROR:', mailErr)
      }

      await loadPayments()
      notify('✅ Approved & credited 5 EP')
    } catch (err) {
      console.error('APPROVE ERROR:', err)
    }
  }

  /* ---------------- REJECT ---------------- */
  const reject = async (p: any) => {
    try {
      const { data: updated, error } = await supabase
        .from('payments')
        .update({ status: 'rejected' })
        .eq('id', p.id)
        .eq('status', 'pending')
        .select()

      if (error) {
        console.error('REJECT ERROR:', error)
        notify('❌ Reject failed')
        return
      }

      if (!updated || updated.length === 0) {
        notify('⚠️ Payment already processed')
        await loadPayments()
        return
      }

      notify('❌ Payment rejected')
      await loadPayments()
    } catch (err) {
      console.error('REJECT ERROR:', err)
    }
  }

  

  if (!authorized) return null
  if (loading) return <p style={{ padding: 20 }}>Loading…</p>

  return (
    <div
      style={{
        padding: 20,
        position: 'relative',
        minHeight: '80vh',
        overflow: 'hidden',
      }}
    >
      {/* 🔥 WATERMARK STATS */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.08,
        }}
      >
        <div
          style={{
            fontSize: 150,
            fontWeight: 900,
            lineHeight: 1,
            animation: 'pulse 2.5s infinite ease-in-out',
          }}
        >
          {animatedLive}
        </div>
        <div style={{ fontSize: 26, fontWeight: 600 }}>
          Live Users
        </div>

        <div
          style={{
            fontSize: 95,
            fontWeight: 800,
            marginTop: 50,
          }}
        >
          {animatedTotal}
        </div>
        <div style={{ fontSize: 20 }}>Total Users</div>
      </div>

      {/* 🎓 COLLEGE REQUESTS */}
<div style={{ marginBottom: 30 }}>
  <h2>College Requests</h2>

  {collegeRequests.length === 0 && (
    <p>No pending requests 🎉</p>
  )}

  {collegeRequests.map(req => (
    <div
      key={req.id}
      style={{
        border: '1px solid #eee',
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
        background: 'white',
      }}
    >
      <p><strong>Email:</strong> {req.profiles?.email}</p>
      <p><strong>Name:</strong> {req.name}</p>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => approveCollege(req)}>
          Approve
        </button>

        <button onClick={() => rejectCollege(req)}>
          Reject
        </button>
      </div>
    </div>
  ))}
</div>

      {/* PAYMENTS */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h2>Pending Payments</h2>

        {payments.length === 0 && (
          <p>No pending payments 🎉</p>
        )}

        {payments.map(p => (
          <div
            key={p.id}
            style={{
              border: '1px solid #eee',
              borderRadius: 12,
              padding: 12,
              marginTop: 12,
              background: 'white',
            }}
          >
            <p><strong>UTR:</strong> {p.utr}</p>
            <p><strong>Email:</strong> {p.email || 'Not found'}</p>

            <button
              onClick={() => {
                if (p.email) {
                  navigator.clipboard.writeText(p.email)
                  notify('📋 Email copied')
                }
              }}
              style={{
                marginBottom: 8,
                padding: '4px 8px',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Copy Email
            </button>

            <p>₹{p.amount} → 5 🥐</p>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => approve(p)}>
                Approve
              </button>

              <button onClick={() => reject(p)}>
                Reject
              </button>

              <button
                onClick={async () => {
                  const res = await fetch('/api/admin/send-payment-mail', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: p.user_id }),
                  })

                  const data = await res.json()

                  if (data.mailUrl) {
                    window.open(data.mailUrl, '_blank')
                  }
                }}
              >
                📧 Send Email
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  )
}