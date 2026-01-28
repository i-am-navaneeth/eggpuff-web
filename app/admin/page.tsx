'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNotify } from '../../components/NotificationProvider'

export default function AdminPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const notify = useNotify()

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .ilike('status', 'pending')
        .order('created_at', { ascending: true })

      if (error) {
        notify('❌ Not authorized')
        return
      }

      setPayments(data || [])
      setLoading(false)
    }

    load()
  }, [])

  const approve = async (p: any) => {
    // credit 🥐
    await supabase.from('egg_puff_ledger').insert({
      user_id: p.user_id,
      amount: p.egg_puffs,
      reason: 'Purchase approved',
    })

    // mark approved
    await supabase
      .from('payments')
      .update({ status: 'approved' })
      .eq('id', p.id)

    setPayments(prev => prev.filter(x => x.id !== p.id))
    notify('✅ Approved & credited')
  }

  const reject = async (p: any) => {
    await supabase
      .from('payments')
      .update({ status: 'rejected' })
      .eq('id', p.id)

    setPayments(prev => prev.filter(x => x.id !== p.id))
    notify('❌ Payment rejected')
  }

  if (loading) return <p style={{ padding: 20 }}>Loading…</p>

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin – Payments</h2>

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
          }}
        >
          <p><strong>UTR:</strong> {p.utr}</p>
          <p>₹{p.amount} → {p.egg_puffs} 🥐</p>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => approve(p)}>Approve</button>
            <button onClick={() => reject(p)}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  )
}
