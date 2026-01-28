'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { getEggPuffBalance } from '../lib/rewards'
import BuyPuffModal from './BuyPuffModal'

export default function TopBar() {
  const [userId, setUserId] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [buyOpen, setBuyOpen] = useState(false)

  // ===============================
  // LOAD USER ONCE (NON-BLOCKING)
  // ===============================
  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUserId(data.session?.user.id || null)
    })

    return () => {
      mounted = false
    }
  }, [])

  // ===============================
  // LOAD + REALTIME BALANCE
  // ===============================
  useEffect(() => {
    if (!userId) return

    let mounted = true
    let ledgerChannel: any

    const loadBalance = async () => {
      const b = await getEggPuffBalance(userId)
      if (mounted) setBalance(b)
    }

    loadBalance()

    ledgerChannel = supabase
      .channel('egg-puff-ledger')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'egg_puff_ledger',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadBalance()
        }
      )
      .subscribe()

    return () => {
      mounted = false
      if (ledgerChannel) supabase.removeChannel(ledgerChannel)
    }
  }, [userId])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      {/* LEFT */}
      <h2>EggPuff 🥐</h2>

      {/* RIGHT */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span
          style={{ cursor: 'pointer', fontWeight: 500 }}
          onClick={() => setBuyOpen(true)}
        >
          {balance} 🥐
        </span>

        {/* ASK */}
        <Link href="/ask">
          <button>Ask</button>
        </Link>

        {/* ABOUT / HELP */}
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
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e =>
              (e.currentTarget.style.background = '#e5e7eb')
            }
            onMouseLeave={e =>
              (e.currentTarget.style.background = '#f3f4f6')
            }
          >
            ?
          </div>
        </Link>
      </div>

      <BuyPuffModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
      />
    </div>
  )
}
