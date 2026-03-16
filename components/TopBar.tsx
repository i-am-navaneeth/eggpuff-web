'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { getEggPuffBalance } from '../lib/rewards'
import BuyPuffModal from './BuyPuffModal'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import FeedbackDropdown from '@/components/FeedbackDropdown'

export default function TopBar() {
  const [balance, setBalance] = useState<number>(0)
  const [buyOpen, setBuyOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const isAskPage = pathname === '/ask'

  /* ---------------- LOAD USER + BALANCE ---------------- */

  useEffect(() => {
    let mounted = true
    let ledgerChannel: any

    const loadUserAndBalance = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        if (mounted) {
          setUserId(null)
          setBalance(0)
        }
        return
      }

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
      listener?.subscription?.unsubscribe()
      if (ledgerChannel) supabase.removeChannel(ledgerChannel)
    }
  }, [])

  /* ---------------- ASK BUTTON CATEGORY PREFILL ---------------- */

  const selectedCategory = searchParams.get('category') || 'general'
  const askHref = `/ask?category=${selectedCategory}`

  const [feedbackOpen, setFeedbackOpen] = useState(false)

  /* ---------------- UI ---------------- */

  return (
    <>
      {/* ===================== TOP BAR ===================== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
        }}
      >
        {/* LEFT — LOGO */}
        <h2
  onClick={() => router.push('/feed')}
  className="text-xl sm:text-2xl font-semibold cursor-pointer select-none flex items-center gap-1"
>
  EggPuff
</h2>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto pr-1 sm:pr-2">

          {/* BALANCE */}
          <button
            onClick={() => setBuyOpen(true)}
            title="Buy or PYP"
            className="px-3 sm:px-4 py-1.5 rounded-full text-sm sm:text-base font-medium
                       bg-gray-100 border border-gray-200
                       text-gray-800
                       shadow-sm"
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              background: '#F3F4F6',
              border: '1px solid #E5E7EB',
              fontSize: 'clamp(14px, 0.9vw, 16px)',
              fontWeight: 500,
              color: '#111827',
              cursor: 'pointer',
              lineHeight: 1,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            {balance}
          </button>

          {/* ASK */}
          {!isAskPage && (
            <Link href={askHref} title="Ask a question">
              <button
                className="px-3 sm:px-4 py-1.5 rounded-full text-sm sm:text-base font-medium border border-amber-400 bg-amber-400 text-gray-900"
              >
                Ask
              </button>
            </Link>
          )}

          {/* FEEDBACK */}
          <div className="relative">
            <button
              onClick={() => setFeedbackOpen((prev) => !prev)}
              className="px-3 sm:px-4 py-1.5 rounded-full border border-gray-300 text-sm sm:text-base font-medium text-gray-700"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              Feedback
            </button>

            {feedbackOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 48,
                  right: 0,
                  zIndex: 1000,
                  width: '320px',
                  maxWidth: '90vw',
                }}
              >
                <FeedbackDropdown onClose={() => setFeedbackOpen(false)} />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ===================== BUY / PROMOTE MODAL ===================== */}
      <BuyPuffModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        userId={userId}
        balance={balance}
      />
    </>
  )
}