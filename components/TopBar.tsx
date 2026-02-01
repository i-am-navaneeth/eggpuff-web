'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { getEggPuffBalance } from '../lib/rewards'
import BuyPuffModal from './BuyPuffModal'

export default function TopBar() {
  const [balance, setBalance] = useState<number>(0)
  const [buyOpen, setBuyOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let ledgerChannel: any

    const loadUserAndBalance = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      if (mounted) setUserId(user.id)

      const b = await getEggPuffBalance(user.id)
      if (mounted) setBalance(b)
    }

    loadUserAndBalance()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUserAndBalance()
    })

    ledgerChannel = supabase
      .channel('egg-puff-balance')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'egg_puff_ledger',
        },
        () => {
          loadUserAndBalance()
        }
      )
      .subscribe()

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
      if (ledgerChannel) supabase.removeChannel(ledgerChannel)
    }
  }, [])

  return (
    <>
      {/* TOP BAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          marginBottom: 16,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* LEFT */}
        <h2 style={{ margin: 0 }}>EggPuff 🥐</h2>

        {/* RIGHT */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* BALANCE PILL (opens Buy / Promote modal) */}
          <span
            onClick={() => setBuyOpen(true)}
            title="Buy or use EggPuffs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 999,
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            {balance}
            <span style={{ fontSize: 16 }}>🥐</span>
          </span>

          {/* ASK */}
          <Link href="/ask">
            <button style={{ padding: '6px 14px' }}>
              Ask
            </button>
          </Link>

          {/* ABOUT */}
          <Link href="/about" title="About EggPuff">
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              ?
            </div>
          </Link>
        </div>
      </div>

      {/* BUY / PROMOTE MODAL */}
      <BuyPuffModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        userId={userId}
        balance={balance}
      />
    </>
  )
}
