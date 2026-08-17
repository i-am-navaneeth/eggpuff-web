'use client'

import { useEffect, useState, useRef } from 'react'
import { useNavigation } from '@/components/navigation/NavigationProvider'
import { supabase } from '../lib/supabase'
import { getEggPuffBalance } from '../lib/rewards'
import BuyPuffModal from './BuyPuffModal'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import useScrollVisibility from '@/hooks/useScrollVisibility'
import {
  BackButton,
  DefaultTitle,
  DefaultBalance,
  ThreeDotsButton,
} from '@/components/topbar/TopBarSlots'

import CampusMatchMenu from '@/components/topbar/CampusMatchMenu'


type TopBarProps = {
  currentUserId?: string | null
  onRefreshFeed?: () => void

  title?: React.ReactNode
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode

  hideBalance?: boolean
  hideEggPuff?: boolean

  showBack?: boolean
  onBack?: () => void
}

export default function TopBar({
  currentUserId,
  onRefreshFeed,

  title,
  leftSlot,
  rightSlot,

  hideBalance = false,
  hideEggPuff = false,

  showBack = false,
  onBack,
}: TopBarProps) {

  const [balance, setBalance] = useState<number>(0)
  const [buyOpen, setBuyOpen] = useState(false)
  const [menuOpen, setMenuOpen] =
  useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const { openEditProfile } = useNavigation()
  const pathname = usePathname()
  const usernameFromPath =
  pathname?.startsWith('/u/')
    ? pathname.split('/u/')[1]
    : null
  const searchParams = useSearchParams()
  const router = useRouter()

  const isQuestionPage =
  pathname.startsWith('/question/')

const scrollVisible =
  useScrollVisibility()

const showUI =
  pathname.startsWith('/reader/')
    ? true
    : scrollVisible

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

  const [miniProfileLoading, setMiniProfileLoading] =
  useState(true)

  const [pullDistance, setPullDistance] =
  useState(0)
  const [pulling, setPulling] =
  useState(false)
  const touchStartY =
  useRef(0)

  /* ---------------- LOAD USER + BALANCE ---------------- */

  useEffect(() => {
  let mounted = true
 let ledgerChannel: any = null

  const loadUserAndBalance = async () => {
    const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

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
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

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
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

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

  let mounted = true

  const loadMiniProfile =
    async () => {

      if (!usernameFromPath) {

        if (mounted) {
          setMiniProfile(null)
          setMiniProfileLoading(false)
        }

        return
      }

      // 🔥 start loading
      if (mounted) {
        setMiniProfileLoading(true)
      }

      // 🔥 get logged user FIRST
     const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

      // 🔥 get viewed profile
      const {
        data: profile
      } = await supabase

        .from('profiles')

        .select('*')

        .eq(
          'username',
          usernameFromPath
        )

        .maybeSingle()

      if (!profile) {

        if (mounted) {
          setMiniProfile(null)
          setMiniProfileLoading(false)
        }

        return
      }

      // 🔥 question count
      const { count } =
        await supabase

          .from('questions')

          .select('*', {
            count: 'exact',
            head: true,
          })

          .eq(
            'user_id',
            profile.user_id
          )

      // 🔥 follow state
      let following = false

      if (
        user &&
        profile.user_id
      ) {

        const {
          data: follow
        } = await supabase

          .from('follows')

          .select('id')

          .eq(
            'follower_id',
            user.id
          )

          .eq(
            'following_id',
            profile.user_id
          )

          .maybeSingle()

        following = !!follow
      }

      // 🔥 ATOMIC UPDATE
      // everything updates together
      if (mounted) {

        setMiniProfile(profile)

        setMiniQuestionsCount(
          count || 0
        )

        setMiniFollowing(
          following
        )

        setMiniProfileLoading(false)
      }
    }

  loadMiniProfile()

  return () => {
    mounted = false
  }

}, [usernameFromPath])

const handleMiniFollow = async () => {
  if (!miniProfile) return

  const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

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

if (pathname.startsWith('/communities')) {
  return null
}

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
      className={`fixed top-0 left-0 right-0 z-[2000] transition-transform duration-300 ${
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
       {/* LEFT */}
<div
  style={{
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  }}
>
  {showBack ? (
  <BackButton
    onClick={
      onBack ??
      (() => router.back())
    }
  />
) : null}
</div>

{/* CENTER */}
<div
  style={{
    flex: 1,
    minWidth: 0,
    marginLeft: 16,
    marginRight: 8,

    display: 'flex',
    alignItems: 'center',
  }}
>
  {pathname === '/browser' ? (

    <div
      className="
        flex items-center
        gap-3
        w-full
      "
    >
      {/* CLOSE */}
      <button
        onClick={() => router.back()}
        className="
          flex items-center justify-center
          w-8 h-8 rounded-full
          active:scale-95 transition
        "
        style={{
          border: 'none',
          background: 'transparent',
          flexShrink: 0,
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div
        style={{
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {searchParams.get('domain') ||
            'Website'}
        </div>

        <div
          style={{
            fontSize: 12,
            color: '#6B7280',
          }}
        >
          Open inside EggPuff
        </div>
      </div>
    </div>

    ) : isProfilePage ? (

    showMiniProfile &&
    !miniProfileLoading &&
    miniProfile ? (

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 0,
        }}
      >
        {miniProfile.avatar_url ? (
          <img
            src={miniProfile.avatar_url}
            alt=""
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#F1F5F9',
              flexShrink: 0,
            }}
          />
        )}

        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: '#111827',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {miniProfile.name || 'EggPuff'}
        </h2>
      </div>

    ) : (

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          minWidth: 0,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: '#111827',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          EggPuff
        </h2>
      </div>

    )

  ) : pathname.startsWith('/reader/') ? (

    <DefaultTitle
      title={
        title ??
        'Document'
      }
    />

  ) : pathname.startsWith('/resources') ? (

    <DefaultTitle
      title="Resources"
    />

  ) : (

    <div
  onClick={() => {
    const now = Date.now()

    if (
      (window as any).__ep_last_tap &&
      now - (window as any).__ep_last_tap < 320
    ) {
      if (pathname === '/feed') {
        onRefreshFeed?.()
      } else {
        router.push('/feed')
      }
    } else {
      router.push('/feed')
    }

    ;(window as any).__ep_last_tap = now
  }}
  style={{
    position: 'relative',

    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',

    cursor: 'pointer',

    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1,

    whiteSpace: 'nowrap',

    padding: '5px 6px',

    overflow: 'visible',
  }}
>

  {/* ================= EGGPuff TEXT ================= */}

  <span
    style={{
      position: 'relative',

      zIndex: 3,

      /*
       * KEEP EGGPuff EXACTLY AS NORMAL.
       */
      color: 'inherit',

      fontSize: 20,
      fontWeight: 800,
      lineHeight: 1,

      whiteSpace: 'nowrap',
    }}
  >
    {title ??
      (pathname === '/notifications'
        ? 'Notifications'
        : 'EggPuff')}
  </span>
</div>

  )}
</div>

{/* RIGHT */}
<div
  style={{
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  }}
>
  {rightSlot ? (
    rightSlot
  ) : hideBalance ? (
    <ThreeDotsButton
      onClick={() =>
        setMenuOpen(true)
      }
    />
  ) : pathname !== '/notifications' &&
    !pathname.startsWith('/u/') &&
    pathname !== '/browser' ? (
    <DefaultBalance
      balance={balance}
      onClick={() =>
        setBuyOpen(true)
      }
    />
  ) : null}
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
{hideBalance && (
  <CampusMatchMenu
    currentUserId={userId}
    match={{
      creator_id: '',
      joined: false,
    }}
    onInvite={() => {
      // TODO
    }}
    onReport={() => {
      // TODO
    }}
    onLeave={() => {
      // TODO
    }}
    onDelete={() => {
      // TODO
    }}
  />
)}
  </>
)}