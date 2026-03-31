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
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [avatar, setAvatar] = useState<string | null>(null);

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('college_id, batch_year')
      .eq('id', user.id)
      .single()

    setIsProfileComplete(
      !!profile?.college_id && !!profile?.batch_year
    )

    // 🔥 setup realtime INSIDE (so user is available)
    if (!ledgerChannel) {
      ledgerChannel = supabase
        .channel('egg-puff-balance')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'egg_puff_ledger',
            filter: `user_id=eq.${user?.id}`, // ✅ safe + correct
          },
          () => {
            loadUserAndBalance()
          }
        )
        .subscribe()
    }
  }

  loadUserAndBalance()

  const { data: listener } = supabase.auth.onAuthStateChange(() => {
    loadUserAndBalance()
  })

  return () => {
    mounted = false
    listener?.subscription?.unsubscribe()
    if (ledgerChannel) supabase.removeChannel(ledgerChannel)
  }
}, [])

  useEffect(() => {
  let channel: any;

  const loadAvatar = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();

    if (data?.avatar_url) {
      setAvatar(data.avatar_url);
    }

    // 🔥 LIVE SYNC (moved inside to access user)
    channel = supabase
      .channel('avatar-sync')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user?.id}`, // ✅ FIXED
        },
        (payload: any) => {
          if (payload.new?.avatar_url) {
            setAvatar(payload.new.avatar_url);
          }
        }
      )
      .subscribe();
  };

  loadAvatar();

  return () => {
    if (channel) supabase.removeChannel(channel);
  };
}, []);

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

          <button
  onClick={() => router.push('/profile')}
  title="Profile"
  style={{
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: '1px solid #E5E7EB',
    background: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 2, // 🔥 key for spacing
  }}
>
  {avatar ? (
    <img
      src={avatar}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
      }}
    />
  ) : (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F4B860"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4.2" />
      <path d="M4 20c2.5-4.5 6.5-6.5 8-6.5s5.5 2 8 6.5" />
    </svg>
  )}
</button>

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