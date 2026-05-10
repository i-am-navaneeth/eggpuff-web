'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { getEggPuffBalance } from '../lib/rewards'
import BuyPuffModal from './BuyPuffModal'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import useScrollVisibility from '@/hooks/useScrollVisibility'



export default function TopBar({
  currentUserId,
  onRefreshFeed,
}: {
  currentUserId?: string | null
  onRefreshFeed?: () => void
}) {
  const [balance, setBalance] = useState<number>(0)
  const [buyOpen, setBuyOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const pathname = usePathname()
  const usernameFromPath =
  pathname?.startsWith('/u/')
    ? pathname.split('/u/')[1]
    : null
  const searchParams = useSearchParams()
  const router = useRouter()

  const isQuestionPage = pathname.startsWith('/question/')
  const showUI = useScrollVisibility()

  const isAskPage = pathname === '/ask'
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [avatar, setAvatar] = useState<string | null>(null);
  
  const isProfilePage = pathname.startsWith('/u')
  const [miniProfile, setMiniProfile] = useState<any>(null)
  const [showMiniProfile, setShowMiniProfile] = useState(false)

  const isNotificationsPage = pathname === '/notifications'
  const [miniQuestionsCount, setMiniQuestionsCount] = useState(0)
  const [miniFollowing, setMiniFollowing] = useState(false)
  const [miniLoadingFollow, setMiniLoadingFollow] = useState(false)

  const [pullDistance, setPullDistance] =
  useState(0)
  const [pulling, setPulling] =
  useState(false)
  const touchStartY =
  useRef(0)

useEffect(() => {
  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
    }
  }

  loadUser()
}, [])

  /* ---------------- LOAD USER + BALANCE ---------------- */

  useEffect(() => {
  let mounted = true
 let ledgerChannel: any = null

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

useEffect(() => {
  if (!isProfilePage) return

  const handleScroll = () => {
    setShowMiniProfile(window.scrollY > 120)
  }

  window.addEventListener('scroll', handleScroll)

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single()

    if (data) setMiniProfile(data)
  }

  loadProfile()

  return () => window.removeEventListener('scroll', handleScroll)
}, [isProfilePage])

useEffect(() => {
  const loadMiniProfile = async () => {
    if (!usernameFromPath) {
      setMiniProfile(null)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', usernameFromPath)
      .maybeSingle()

    if (!profile) return

    setMiniProfile(profile)

    // question count
    const { count } = await supabase
      .from('questions')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('user_id', profile.user_id)

    setMiniQuestionsCount(count || 0)

    // follow state
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: follow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.user_id)
        .maybeSingle()

      setMiniFollowing(!!follow)
    }
  }

  loadMiniProfile()
}, [usernameFromPath])

const handleMiniFollow = async () => {
  if (!miniProfile) return

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  setMiniLoadingFollow(true)

  if (miniFollowing) {
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', miniProfile.user_id)

    setMiniFollowing(false)
  } else {
    await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: miniProfile.user_id,
      })

    setMiniFollowing(true)
  }

  setMiniLoadingFollow(false)
}

  /* ---------------- ASK BUTTON CATEGORY PREFILL ---------------- */

  const selectedCategory = searchParams.get('category') || 'general'
  const askHref = `/ask?category=${selectedCategory}`

  const [feedbackOpen, setFeedbackOpen] = useState(false)

  useEffect(() => {
  const handleTouchStart = (
    e: TouchEvent
  ) => {
    if (window.scrollY > 0) return

    touchStartY.current =
      e.touches[0].clientY
  }

  const handleTouchMove = (
    e: TouchEvent
  ) => {
    if (window.scrollY > 0) return

    const distance =
      e.touches[0].clientY -
      touchStartY.current

    if (distance > 0) {
      setPulling(true)

      setPullDistance(
        Math.min(distance * 0.5, 90)
      )
    }
  }

  const handleTouchEnd =
  async () => {
    try {
      // 🔥 trigger refresh only after enough pull
      if (
        pullDistance >= 70 &&
        onRefreshFeed
      ) {
        await onRefreshFeed()
      }
    } finally {
      // 🔥 always reset UI smoothly
      setPulling(false)

      setPullDistance(0)
    }
  }

  window.addEventListener(
    'touchstart',
    handleTouchStart
  )

  window.addEventListener(
    'touchmove',
    handleTouchMove
  )

  window.addEventListener(
    'touchend',
    handleTouchEnd
  )

  return () => {
    window.removeEventListener(
      'touchstart',
      handleTouchStart
    )

    window.removeEventListener(
      'touchmove',
      handleTouchMove
    )

    window.removeEventListener(
      'touchend',
      handleTouchEnd
    )
  }
}, [pullDistance])

  /* ---------------- UI ---------------- */

  return (
  <>
    {/* ===================== TOP BAR ===================== */}
    <div
  style={{
    height: pulling
      ? pullDistance
      : 0,

    transition:
      pulling
        ? 'none'
        : 'height 0.2s ease',

    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',

    overflow: 'hidden',
  }}
>
  <div
    style={{
      width: 24,
      height: 24,

      borderRadius: '50%',

      border:
        '2px solid #FDE7BF',

      borderTop:
        '2px solid #F4B860',

      animation:
        pullDistance > 70
          ? 'spin 0.7s linear infinite'
          : 'none',

      opacity:
        pullDistance / 70,
    }}
  />
</div>
    <div
      className={`fixed top-0 left-0 right-0 z-[999] transition-transform duration-300 ${
        isProfilePage
  ? 'translate-y-0'
  : showUI
  ? 'translate-y-0'
  : '-translate-y-full'
      }`}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: '#fff', // 🔥 IMPORTANT (otherwise it becomes transparent)
          borderBottom: '1px solid #eee',
        }}
      >
        {(isQuestionPage || pathname.startsWith('/u') || pathname === '/notifications') ? (
  <button
    onClick={() => router.back()}
    className="flex items-center justify-center w-8 h-8 rounded-full active:scale-95 transition"
    style={{
      border: 'none',
      background: 'transparent',
      marginRight: 10,
    }}
  >
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
) : (
  <div style={{ width: 15 }} />
)}

        {/* LOGO / MINI PROFILE */}
{isProfilePage && showMiniProfile && miniProfile ? (
  <div className="flex items-center justify-between w-full">

    {/* LEFT */}
    <div className="flex items-center gap-3 min-w-0">

      {/* AVATAR */}
      <img
        src={miniProfile.avatar_url || '/default-avatar.png'}
        className="w-8 h-8 rounded-full object-cover"
      />

      {/* USER */}
      <div className="leading-tight min-w-0">
        <div className="text-sm font-semibold truncate">
          {miniProfile.name || miniProfile.username}
        </div>

        <div className="text-xs text-gray-500">
          {miniQuestionsCount} question
          {miniQuestionsCount !== 1 ? 's' : ''}
        </div>
      </div>

    </div>

    {/* RIGHT */}
    {currentUserId &&
    miniProfile?.user_id &&
    String(miniProfile.user_id).trim() ===
      String(currentUserId).trim() ? (

      <button
        onClick={() => router.push('/profile')}
        className="
          px-4 py-1.5 rounded-full
          bg-gray-100 text-black
          text-sm font-medium
        "
      >
        Edit
      </button>

    ) : (

      <button
        onClick={handleMiniFollow}
        disabled={miniLoadingFollow}
        className={`
          px-4 py-1.5 rounded-full
          text-sm font-medium transition
          ${
            miniFollowing
              ? 'bg-gray-200 text-black'
              : 'bg-black text-white'
          }
        `}
      >
        {miniLoadingFollow
          ? '...'
          : miniFollowing
          ? 'Following'
          : 'Follow'}
      </button>

    )}

  </div>
) : (
  <h2
  onClick={() => {
    const now = Date.now()

    // 🔥 double tap detection
    if (
      (window as any).__ep_last_tap &&
      now -
        (window as any).__ep_last_tap <
        320
    ) {
      // 🔥 refresh only if already on feed
      if (pathname === '/feed') {
        onRefreshFeed?.()
      } else {
        router.push('/feed')
      }
    } else {
      // 🔥 single tap = normal navigation
      router.push('/feed')
    }

    ;(window as any).__ep_last_tap =
      now
  }}
  className="text-xl sm:text-2xl font-semibold cursor-pointer select-none flex items-center gap-1"
  style={{
    WebkitTapHighlightColor:
      'transparent',

    userSelect: 'none',

    transition:
      'transform 0.12s ease',
  }}
  onTouchStart={(e) => {
    e.currentTarget.style.transform =
      'scale(0.96)'
  }}
  onTouchEnd={(e) => {
    e.currentTarget.style.transform =
      'scale(1)'
  }}
>
  {pathname === '/notifications'
    ? 'Notifications'
    : 'EggPuff'}
</h2>
)}

        {/* RIGHT SIDE */}
<div className="flex items-center gap-2 sm:gap-3 ml-auto pr-1 sm:pr-2">

  {/* BALANCE */}
  {pathname !== '/notifications' &&
    !pathname.startsWith('/u/') && (
      <div>
        <button
  onClick={() => setBuyOpen(true)}
  className="
    px-3 sm:px-4 py-1.5
    rounded-full
    text-sm sm:text-base
    font-medium
    bg-gray-100
    border border-gray-200
    text-gray-800
    shadow-sm
  "
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }}
>
  <span
    style={{
      fontSize: 16,
      lineHeight: 1,
    }}
  >
    🥐
  </span>

  <span>{balance}</span>
</button>
      </div>
      )}
        </div>
      </div>
    </div>

    {/* ===================== BUY MODAL ===================== */}
    <BuyPuffModal
      open={buyOpen}
      onClose={() => setBuyOpen(false)}
      userId={userId}
      balance={balance}
    />
  </>
)}