'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getEggPuffBalance } from '@/lib/rewards'
import { useRouter } from 'next/navigation'
import QuestionCard from '@/components/QuestionCard'
import Link from 'next/link'
import FollowListSheet from '@/components/FollowListSheet'
import { useNavigation } from '@/components/navigation/NavigationProvider'
import ConnectionsSheet from '@/components/profile/ConnectionsSheet'

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
  ]

  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds)
    if (count >= 1) return `${count}${i.label}`
  }

  return 'now'
}
type Props = {
  username?: string
  scrollContainer?: React.RefObject<HTMLDivElement | null>
  topInset?: number
}

export default function ProfileScreen({
  username,
  scrollContainer,
  topInset = 0,
}: Props) {
 const params = useParams<{ username?: string }>()

const resolvedUsername =
  username !== undefined
    ? username
    : params.username

  const router = useRouter()
  

const [loading, setLoading] = useState(true)

const [profile, setProfile] =
  useState<any>(null)
const [connectionsOpen, setConnectionsOpen] = useState(false)
const [showEpInfo, setShowEpInfo] = useState(false)
const [tooltipLeft, setTooltipLeft] = useState(0)
const [tooltipTop, setTooltipTop] = useState(0)
const [tooltipArrow, setTooltipArrow] = useState(50)
const [tooltipPlacement, setTooltipPlacement] = useState<'top' | 'bottom'>('top')

  const [currentUser, setCurrentUser] =
  useState<any>(null)

  const {
  openEditProfile,
  openQuestion,
} = useNavigation()

  const [isFollowing, setIsFollowing] = useState(false)
  const [loadingFollow, setLoadingFollow] = useState(false)

const [questions, setQuestions] = useState<any[]>([])
const [loadingQuestions, setLoadingQuestions] = useState(true)

const QUESTIONS_PAGE_SIZE = 10

const [questionsOffset, setQuestionsOffset] = useState(0)
const questionsOffsetRef = useRef(0)
const [questionsHasMore, setQuestionsHasMore] = useState(true)
const [loadingMoreQuestions, setLoadingMoreQuestions] =
  useState(false)

const loadMoreQuestionsRef =
  useRef<HTMLDivElement | null>(null)

const questionsObserverRef =
  useRef<IntersectionObserver | null>(null)

const questionsHardLockRef = useRef(false)

  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions')
  const [answers, setAnswers] = useState<any[]>([])
  const [loadingAnswers, setLoadingAnswers] = useState(false)
  const ANSWERS_PAGE_SIZE = 10

const [answersOffset, setAnswersOffset] = useState(0)
const answersOffsetRef = useRef(0)

const [answersHasMore, setAnswersHasMore] =
  useState(true)

const [loadingMoreAnswers, setLoadingMoreAnswers] =
  useState(false)

const loadMoreAnswersRef =
  useRef<HTMLDivElement | null>(null)

const answersObserverRef =
  useRef<IntersectionObserver | null>(null)

const answersHardLockRef =
  useRef(false)

  const [isScrolled, setIsScrolled] = useState(false)
  const [showMiniProfile, setShowMiniProfile] = useState(false)
  const [ep, setEp] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [followSheetOpen, setFollowSheetOpen] = useState(false)

  const [friendsCount, setFriendsCount] = useState(0)
  const [followSheetType, setFollowSheetType] = useState<
  'followers' | 'following' | 'friends'
>('followers')
  

  // ================= TYPES =================
type Notification = {
  id: string
  user_id: string
  actor_id: string
  type: string
  message: string
  is_read: boolean
  created_at: string
}

// ================= STATE =================
const [notifications, setNotifications] = useState<Notification[]>([])
const unreadCount = notifications.filter((n) => !n.is_read).length

const pathname = usePathname()

const [currentUserId, setCurrentUserId] =
  useState<string | null>(null)

useEffect(() => {
  const loadUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setCurrentUserId(
      session?.user?.id ?? null
    )
  }

  loadUser()
}, [])

// ================= FETCH NOTIFICATIONS =================
useEffect(() => {
  if (!userId) return

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setNotifications((data as Notification[]) || [])
  }

  fetchNotifications()
}, [userId])

// ================= REALTIME NOTIFICATIONS =================
useEffect(() => {
  if (!userId) return

  const channel = supabase
   .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        setNotifications((prev) => [
          payload.new as Notification,
          ...prev,
        ])
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [userId])

// ================= USER =================
useEffect(() => {
  let isMounted = true

  const loadUser = async () => {
    const { data } = await supabase.auth.getSession()
    const user = data?.session?.user

    if (isMounted && user) {
      setUserId(user.id)
    }
  }

  loadUser()

  return () => {
    isMounted = false
  }
}, [])
// ================= INITIAL PROFILE LOAD =================
useEffect(() => {
  const loadProfilePage = async () => {
    if (!resolvedUsername) return

    setLoading(true)

    // 🔥 profile first
    const { data: profileData, error } =
      await supabase
        .from('profiles')
        .select('*')
        .eq('username', resolvedUsername)
        .single()

    if (error || !profileData) {
      setLoading(false)
      return
    }

    // 🔥 load EVERYTHING together
    const [
      followingRes,
      followersRes,
      mineRes,
      theirsRes,
      epValue,
      followState,
    ] = await Promise.all([
      supabase
        .from('follows')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq(
          'follower_id',
          profileData.user_id
        ),

      supabase
        .from('follows')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq(
          'following_id',
          profileData.user_id
        ),

      supabase
        .from('follows')
        .select('following_id')
        .eq(
          'follower_id',
          profileData.user_id
        ),

      supabase
        .from('follows')
        .select('follower_id')
        .eq(
          'following_id',
          profileData.user_id
        ),

      getEggPuffBalance(
        profileData.user_id
      ),

      userId
        ? supabase
            .from('follows')
            .select('id')
            .eq(
              'follower_id',
              userId
            )
            .eq(
              'following_id',
              profileData.user_id
            )
            .maybeSingle()
        : Promise.resolve({
            data: null,
          }),
    ])

    const mineIds =
      mineRes.data?.map(
        (m) => m.following_id
      ) || []

    const theirIds =
      theirsRes.data?.map(
        (t) => t.follower_id
      ) || []

    const mutual = mineIds.filter(
      (id) =>
        theirIds.includes(id)
    )

    // 🔥 SINGLE PAINT
    setProfile(profileData)

    setFollowingCount(
      followingRes.count || 0
    )

    setFollowersCount(
      followersRes.count || 0
    )

    setFriendsCount(mutual.length)

    setEp(epValue || 0)

    setIsFollowing(
      !!followState.data
    )

    // 🔥 NOW UI APPEARS TOGETHER
    setLoading(false)
  }

  loadProfilePage()
}, [resolvedUsername, userId])


// ================= FOLLOW HANDLER =================
const handleFollow = async () => {
  if (!userId || !profile?.user_id) return

  if (userId === profile.user_id) return

  setLoadingFollow(true)

  if (isFollowing) {
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', profile.user_id)

    setIsFollowing(false)
    setFollowersCount(prev => Math.max(0, prev - 1))
  } else {
    await supabase
      .from('follows')
      .insert({
        follower_id: userId,
        following_id: profile.user_id,
      })

    setIsFollowing(true)
    setFollowersCount(prev => prev + 1)
  }

  // 🔔 Notification (only when FOLLOW, not unfollow)
if (!isFollowing) {
  await supabase.from('notifications').insert({
    user_id: profile.user_id,
    actor_id: userId,

    type: 'follow',

    message: 'started following you',

    link: `/u/${profile.username}`,

    is_read: false,
  })

  try {
    await fetch('/api/push/send', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        userId: profile.user_id,

        title: `👋 ${currentUser?.name || currentUser?.username || 'Someone'} followed you`,

        message: 'Tap to view their profile.',

        url: `/u/${profile.username}`,
      }),
    })
  } catch {}
}

  setLoadingFollow(false)
}
// ================= FRIEND CHECK =================
const checkFriends = async () => {
  if (!userId || !profile?.user_id) return

  const { data } = await supabase
    .from('follows')
    .select('*')
    .or(
      `and(follower_id.eq.${userId},following_id.eq.${profile.user_id}),and(follower_id.eq.${profile.user_id},following_id.eq.${userId})`
    )

  if (data?.length === 2) {
    // mutual follow → friends
  }
}

// ================= COUNTS =================

const [followingCount, setFollowingCount] = useState(0)
const [followersCount, setFollowersCount] = useState(0)

useEffect(() => {
  if (!profile?.user_id) return

  const channel = supabase
    .channel('follows-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'follows',
      },
      () => {
        // reload counts
        const loadCounts = async () => {
          const { count: followingCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', profile.user_id)

          const { count: followersCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', profile.user_id)

          setFollowingCount(followingCount || 0)
          setFollowersCount(followersCount || 0)
        }

        loadCounts()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [profile])

// ================= SCROLL (TOP BAR SHADOW) =================
useEffect(() => {
  const target = scrollContainer?.current

  const handleScroll = () => {
    const scrollTop = target
      ? target.scrollTop
      : window.scrollY

    setIsScrolled(scrollTop > 10)
  }

  handleScroll()

  if (target) {
    target.addEventListener('scroll', handleScroll)
  } else {
    window.addEventListener('scroll', handleScroll)
  }

  return () => {
    if (target) {
      target.removeEventListener('scroll', handleScroll)
    } else {
      window.removeEventListener('scroll', handleScroll)
    }
  }
}, [scrollContainer])

// ================= SCROLL (MINI PROFILE) =================
useEffect(() => {
  const handleScroll = () => {
    const followButton =
  document.getElementById(
    'profile-follow-button'
  )

if (!followButton) return

const rect =
  followButton.getBoundingClientRect()

setShowMiniProfile(rect.bottom < 0)
  }

  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])

// ================= FETCH QUESTIONS =================
useEffect(() => {
  if (!profile?.user_id) return

  const fetchQuestions = async () => {
    setLoadingQuestions(true)

const { data, error } = await supabase
  .from("questions")
  .select("*")
  .eq("user_id", profile.user_id)
  .order("created_at", { ascending: false })
  .range(0, QUESTIONS_PAGE_SIZE - 1)

if (error) {
  console.error("Questions error:", error)
}

    if (!error) {
  const formatted =
    (data || []).map((q: any) => ({
      ...q,
      helpful_count: q.question_helpful?.length ?? 0,
      is_helpful:
        q.question_helpful?.some(
          (h: any) => h.user_id === currentUserId
        ) ?? false,
    }))

  setQuestions(formatted)

  const nextOffset = formatted.length

  questionsOffsetRef.current = nextOffset
  setQuestionsOffset(nextOffset)

  setQuestionsHasMore(
    formatted.length === QUESTIONS_PAGE_SIZE
  )
}

    setLoadingQuestions(false)
  }

  fetchQuestions()
}, [profile])

const loadMoreQuestions = async () => {

  if (
    questionsHardLockRef.current ||
    !questionsHasMore ||
    !profile?.user_id
  ) {
  
    return
  }


  questionsHardLockRef.current = true
  setLoadingMoreQuestions(true)

  const { data, error } = await supabase
  .from("questions")
  .select(`
    *,
    question_helpful (
      user_id
    )
  `)
  .eq("user_id", profile.user_id)
  .order("created_at", { ascending: false })
  .range(
    questionsOffsetRef.current,
    questionsOffsetRef.current + QUESTIONS_PAGE_SIZE - 1
  )

  if (!error && data) {
const formatted =
  (data || []).map((q: any) => ({
    ...q,
    helpful_count: q.question_helpful?.length ?? 0,
    is_helpful:
      q.question_helpful?.some(
        (h: any) => h.user_id === currentUserId
      ) ?? false,
  }))

setQuestions(prev => {
  const map = new Map()

  prev.forEach(q => map.set(q.id, q))
  formatted.forEach(q => map.set(q.id, q))

  return [...map.values()]
})

    questionsOffsetRef.current += data.length
setQuestionsOffset(questionsOffsetRef.current)

    if (data.length < QUESTIONS_PAGE_SIZE) {
      setQuestionsHasMore(false)
      questionsObserverRef.current?.disconnect()
    }
  }
  setLoadingMoreQuestions(false)
questionsHardLockRef.current = false
}

const loadMoreQuestionsFn =
  useRef(loadMoreQuestions)

useEffect(() => {
  loadMoreQuestionsFn.current =
    loadMoreQuestions
})

useEffect(() => {
  if (activeTab !== "questions") return

  const el = loadMoreQuestionsRef.current
  if (!el) return

  // Disconnect any previous observer
  questionsObserverRef.current?.disconnect()

  // Create a new observer
  questionsObserverRef.current = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]

      if (
        entry.isIntersecting &&
        !questionsHardLockRef.current &&
        questionsHasMore
      ) {
        loadMoreQuestions()
      }
    },
    {
      root: null,
      rootMargin: "600px",
      threshold: 0,
    }
  )

  questionsObserverRef.current.observe(el)

  return () => {
    questionsObserverRef.current?.disconnect()
  }
}, [
  activeTab,
  loadingQuestions,
  questions.length,
  questionsHasMore,
])

useEffect(() => {
  if (!questionsHasMore) {
    questionsObserverRef.current?.disconnect()
  }
}, [questionsHasMore])

const loadMoreAnswers = async () => {
  if (
    answersHardLockRef.current ||
    !answersHasMore ||
    !profile?.user_id
  ) {
    return
  }

  answersHardLockRef.current = true
  setLoadingMoreAnswers(true)

  const {
    data: answersData,
    error,
  } = await supabase
    .from('answers')
    .select('*')
    .eq(
      'user_id',
      profile.user_id
    )
    .order('created_at', {
      ascending: false,
    })
    .range(
      answersOffsetRef.current,
      answersOffsetRef.current +
        ANSWERS_PAGE_SIZE -
        1
    )

  if (!error && answersData) {
    const questionIds =
      answersData.map(
        (a) => a.question_id
      )

    let questionsMap: any = {}

    if (questionIds.length) {
      const {
        data: questionsData,
      } = await supabase
        .from('questions')
        .select(`
          id,
          text
        `)
        .in(
          'id',
          questionIds
        )

      questionsMap =
        Object.fromEntries(
          (questionsData || []).map(
            (q) => [q.id, q]
          )
        )
    }

    const formatted =
      answersData.map(
        (answer) => ({
          ...answer,
          questions:
            questionsMap[
              answer.question_id
            ] || null,
        })
      )

    setAnswers(prev => {
      const map =
        new Map()

      prev.forEach(a =>
        map.set(a.id, a)
      )

      formatted.forEach(a =>
        map.set(a.id, a)
      )

      return [...map.values()]
    })

    answersOffsetRef.current +=
      formatted.length

    setAnswersOffset(
      answersOffsetRef.current
    )

    if (
      formatted.length <
      ANSWERS_PAGE_SIZE
    ) {
      setAnswersHasMore(false)

      answersObserverRef.current?.disconnect()
    }
  }

  setLoadingMoreAnswers(false)
  answersHardLockRef.current =
    false
}

useEffect(() => {
  if (
    activeTab !== 'answers'
  )
    return

  const el =
    loadMoreAnswersRef.current

  if (!el) return

  answersObserverRef.current?.disconnect()

  answersObserverRef.current =
    new IntersectionObserver(
      (entries) => {
        if (
          entries[0]
            .isIntersecting &&
          !answersHardLockRef.current &&
          answersHasMore
        ) {
          loadMoreAnswers()
        }
      },
      {
        root: null,
        rootMargin: '600px',
        threshold: 0,
      }
    )

  answersObserverRef.current.observe(el)

  return () =>
    answersObserverRef.current?.disconnect()
}, [
  activeTab,
  answers.length,
  answersHasMore,
])

useEffect(() => {

  if (activeTab !== 'answers')
    return

  if (!profile?.user_id)
    return

  const fetchAnswers =
    async () => {

      setLoadingAnswers(true)

      const profileUserId =
        profile.user_id ||
        profile.id

      // 🔥 FETCH ANSWERS

const {
  data: answersData,
  error,
} = await supabase
  .from('answers')
  .select('*')
  .eq(
    'user_id',
    profileUserId
  )
  .order('created_at', {
    ascending: false,
  })
  .range(
    0,
    ANSWERS_PAGE_SIZE - 1
  )

      if (error) {

        console.error(
          'ANSWERS ERROR:',
          error
        )

        setLoadingAnswers(false)

        return
      }

      // 🔥 FETCH QUESTIONS

      const questionIds =
        answersData?.map(
          (a) => a.question_id
        ) || []

      let questionsMap: any = {}

      if (questionIds.length > 0) {

        const {
          data: questionsData,
        } = await supabase

          .from('questions')

          .select(`
            id,
            text
          `)

          .in(
            'id',
            questionIds
          )

        questionsMap =
          Object.fromEntries(

            (questionsData || [])
              .map((q) => [
                q.id,
                q,
              ])
          )
      }

      // 🔥 MERGE

      const formatted =
        (answersData || [])
          .map((answer) => ({

            ...answer,

            questions:
              questionsMap[
                answer.question_id
              ] || null,
          }))

      setAnswers(formatted)

      const nextOffset =
  formatted.length

answersOffsetRef.current =
  nextOffset

setAnswersOffset(nextOffset)

setAnswersHasMore(
  formatted.length ===
    ANSWERS_PAGE_SIZE
)

      setLoadingAnswers(false)
    }

  fetchAnswers()

}, [activeTab, profile])

useEffect(() => {
  const loadUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const user = session?.user

    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select(`
  name,
  username,
  avatar_url,
  is_verified,
  bio,
  batch_year,
  college:colleges(name),
  streak_count
`)
      .eq('user_id', user.id)
      .single()

    setCurrentUser(profileData)
  }

  loadUser()
}, [])

useEffect(() => {
  if (!showEpInfo) return

  const close = () => setShowEpInfo(false)

  document.addEventListener('click', close)

  return () => {
    document.removeEventListener('click', close)
  }
}, [showEpInfo])

  if (loading) {
    return <div className="p-5">Loading...</div>
  }

  if (!profile) {
    return <div className="p-5">User not found</div>
  }

if (pathname.startsWith('/question/')) {
  return null
}

  return (
<div
  className="max-w-[600px] mx-auto px-5"
  style={{
    paddingTop: topInset,
    paddingBottom: 80,
  }}
>

      {/* HEADER */}
<div className="flex flex-col items-center text-center -mt-4">

  {/* Avatar */}
<div
  style={{
    position: 'relative',
    width: 96,
    height: 96,
    margin: '80px auto 0',
  }}
>
  <img
    src={profile.avatar_url || '/default-avatar.png'}
    className="w-24 h-24 rounded-full object-cover"
  />

  {/* Own profile */}
  {userId === profile.user_id ? (
    <button
      onClick={openEditProfile}
      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:scale-105 active:scale-95 transition"
    >
      <svg
  xmlns="http://www.w3.org/2000/svg"
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2.2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M12 20h9" />
  <path d="M16.5 3.5a2.12 2.12 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
</svg>
    </button>
  ) : (
   <button
  onClick={handleFollow}
  disabled={loadingFollow}
  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 transition hover:scale-105 active:scale-95"
  title={isFollowing ? 'Following' : 'Follow'}
>
  {isFollowing ? (
    /* Check */
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ) : (
    /* Plus */
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )}
</button>
  )}
</div>

  <h1 className="mt-4 text-3xl font-bold">
    @{profile.username}
  </h1>

  <p className="text-lg text-gray-600 mt-1">
    {profile.name}
  </p>

  {profile.bio && (
    <p className="mt-3 max-w-xs text-sm text-gray-700 leading-relaxed">
      {profile.bio}
    </p>
  )}

<div className="mt-6 flex w-full max-w-sm gap-3">

  {/* Badges */}
  <div className="flex-1 rounded-2xl border border-dashed border-gray-300 p-4 text-center">

    <div className="text-xl">🏅</div>

    <div className="mt-1 font-semibold">
      Badges
    </div>

  </div>

{/* EP Points */}
<div className="flex-1 flex">

  {/* Tooltip */}
  <div
  className={`fixed z-[9999] rounded-2xl bg-neutral-800 text-white p-4 text-left shadow-2xl border border-neutral-700 transition-all duration-200 ${
    showEpInfo
      ? 'opacity-100 scale-100'
      : 'opacity-0 scale-95 pointer-events-none'
  }`}
  style={{
  width: 260,
  left: tooltipLeft,
  top: tooltipTop,
}}
>
  <div className="text-[14px] font-semibold mb-1">
    EP Points
  </div>

  <p className="text-[11px] leading-5 text-neutral-200">
    Earn <span className="font-medium">EP(EggPuff)</span> Points by asking, answering, and contributing.
    Spend them to <span className="font-medium">Promote your profile</span> or unlock exciting EggPuff features.
  </p>

  <div
  className={`absolute w-3 h-3 bg-neutral-800 border-neutral-700 rotate-45 -translate-x-1/2 ${
    tooltipPlacement === 'top'
      ? 'bottom-[-6px] border-r border-b'
      : 'top-[-6px] border-l border-t'
  }`}
  style={{
    left: tooltipArrow,
  }}
/>
</div>

  {/* Card */}
  <div
    onClick={(e) => {
  e.stopPropagation()
  const card = e.currentTarget.getBoundingClientRect()

  const TOOLTIP_WIDTH = 260
  const TOOLTIP_HEIGHT = 132
  const GAP = 10
  const SCREEN_PADDING = 12

  const tapX = e.clientX
  const tapY = e.clientY

  let left = tapX - TOOLTIP_WIDTH / 2

  left = Math.max(
    SCREEN_PADDING,
    Math.min(
      left,
      window.innerWidth - TOOLTIP_WIDTH - SCREEN_PADDING
    )
  )

  let arrow = tapX - left

  arrow = Math.max(
    18,
    Math.min(TOOLTIP_WIDTH - 18, arrow)
  )

  const touchedBottomHalf =
    tapY > card.top + card.height / 2

  let top = 0

  if (touchedBottomHalf) {
    setTooltipPlacement('bottom')
    top = tapY + GAP
  } else {
    setTooltipPlacement('top')
    top = tapY - TOOLTIP_HEIGHT - GAP
  }

  setTooltipLeft(left)
  setTooltipTop(top)
  setTooltipArrow(arrow)

  setShowEpInfo(prev => !prev)
}}
    className="w-full flex flex-col justify-center rounded-2xl border border-gray-200 p-4 text-center cursor-pointer select-none"
  >
    <div className="text-xl font-bold">
      🥐 {ep}
    </div>

    <div className="mt-1 text-xs text-gray-500">
      EP Points
    </div>
  </div>

</div>

</div>

<button
  onClick={() => setConnectionsOpen(true)}
  className="
    mt-3
    mb-3
    text-sm
    text-gray-400
    hover:text-black
    active:text-black
    active:scale-95
    transition
    duration-150
  "
>
  See connections
</button>

</div>

{/* ===================== TABS ===================== */}
<div
  className="sticky z-40 bg-[#f5f5f5] border-b"
  style={{
    top: topInset,
  }}
>
  <div className="max-w-[600px] mx-auto px-5 flex justify-center gap-8 text-sm font-medium h-[40px] items-end">
    <button
      onClick={() => setActiveTab('questions')}
      className={`pb-2 ${
        activeTab === 'questions'
          ? 'border-b-2 border-black'
          : 'text-gray-400'
      }`}
    >
      Questions
    </button>

    <button
      onClick={() => setActiveTab('answers')}
      className={`pb-2 ${
        activeTab === 'answers'
          ? 'border-b-2 border-black'
          : 'text-gray-400'
      }`}
    >
      Answers
    </button>

  </div>
</div>

{/* ===================== CONTENT ===================== */}
<div className="mt-4">

  {activeTab === 'questions' ? (
    <>
      {loadingQuestions && (
        <p className="text-center text-sm text-gray-400">Loading...</p>
      )}

      {!loadingQuestions && questions.length === 0 && (
        <p className="text-center text-sm text-gray-400">
          No questions yet
        </p>
      )}

{questions
  .filter((q) => {
    const now = new Date()

    // ❌ hide expired bubble
    if (q.type === 'bubble' && q.expires_at) {
      if (new Date(q.expires_at) <= now) return false
    }

    // ❌ remove stale trending
    if (q.is_trending && q.created_at) {
      const created = new Date(q.created_at)
      const diffHours =
        (now.getTime() - created.getTime()) /
        (1000 * 60 * 60)

      if (diffHours > 24) {
        return true
      }
    }

    return true
  })
  .map((q) => (
    <QuestionCard
  key={q.id}
  q={{
    ...q,
    user_name: profile.name,
    username: profile.username,
    avatar_url: profile.avatar_url,
    is_anonymous: false,
    answers_count: q.answers_count ?? 0,
    hideStreak: true,
  }}
  currentUserId={currentUserId}
  onDelete={(deletedId) => {
    setQuestions((prev) =>
      prev.filter(
        (q) => q.id !== deletedId
      )
    )
  }}
/>
  ))}
{questionsHasMore && (
  <div
    ref={loadMoreQuestionsRef}
    className="h-1"
  />
)}

{loadingMoreQuestions && (
  <div className="py-6 text-center text-sm text-muted-foreground">
    Loading more...
  </div>
)}
    </>
  ) : (
    <>

{!loadingAnswers && answers.length === 0 && (
  <p className="text-center text-sm text-gray-400">
    No answers yet
  </p>
)}

<div className="mt-6 space-y-6">

  {answers.map((a) => (
    <div key={a.id}>

      {/* QUESTION (CONTEXT — LIGHT) */}
      <p className="text-xs text-gray-400 border-l-2 border-gray-200 pl-2 mb-2 line-clamp-2">
        {a.questions?.text}
      </p>

      {/* ANSWER = QUESTION CARD STYLE */}
      <div
        onClick={() =>
  openQuestion(a.question_id)
}
        className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm hover:shadow-md transition active:scale-[0.98] cursor-pointer"
      >

        {/* HEADER */}
        <div className="flex items-center gap-2 mb-2">
          <img
            src={profile.avatar_url}
            className="w-8 h-8 rounded-full object-cover"
          />

          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-black">
              {profile.name}
            </span>

            <span className="text-xs text-gray-500">
              @{profile.username} •{" "}
              {timeAgo(a.created_at)}
            </span>
          </div>
        </div>

        {/* ANSWER */}
        <p className="text-base text-black leading-relaxed">
          {a.text}
        </p>

      </div>

    </div>
  ))}

  {/* LOAD MORE TRIGGER */}
  {answersHasMore && (
    <div
      ref={loadMoreAnswersRef}
      className="h-1"
    />
  )}

  {/* LOADING MORE */}
  {loadingMoreAnswers && (
    <div className="text-center text-sm text-gray-400">
      Loading more...
    </div>
  )}

  {/* END */}
  {!answersHasMore &&
    answers.length > 0 && (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No more answers
      </div>
    )}

</div>
    </>
  )}

</div>

<FollowListSheet
  open={followSheetOpen}
  onClose={() => setFollowSheetOpen(false)}
  type={followSheetType}
  profileUserId={profile.user_id}
  currentUserId={userId}
  bottomOffset={
    userId === profile.user_id
      ? 64
      : 0
  }
/>

<ConnectionsSheet
  open={connectionsOpen}
  onClose={() => setConnectionsOpen(false)}
  profileUserId={profile.user_id}
  currentUserId={userId}
/>
    </div>
  )
}