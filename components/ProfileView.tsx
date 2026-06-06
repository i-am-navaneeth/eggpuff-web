'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getEggPuffBalance } from '@/lib/rewards'
import { useRouter } from 'next/navigation'
import QuestionCard from '@/components/QuestionCard'
import FollowListSheet from '@/components/FollowListSheet'

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

export default function ProfilePage() {
  const params = useParams<{ username: string }>()
  const username = params.username
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [currentUser, setCurrentUser] =
  useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [isFollowing, setIsFollowing] = useState(false)
  const [loadingFollow, setLoadingFollow] = useState(false)

  const [questions, setQuestions] = useState<any[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)

  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions')
  const [answers, setAnswers] = useState<any[]>([])
  const [loadingAnswers, setLoadingAnswers] = useState(false)

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
    if (!username) return

    setLoading(true)

    // 🔥 profile first
    const { data: profileData, error } =
      await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
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
}, [username, userId])


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
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 10)
  }

  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])

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
    console.log('PROFILE:', profile)
    console.log('FETCHING QUESTIONS FOR:', profile.user_id)

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('user_id', profile.user_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('ERROR:', error)
    } else {
      console.log('QUESTIONS:', data)
      setQuestions(data || [])
    }

    setLoadingQuestions(false)
  }

  fetchQuestions()
}, [profile])

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

        .order(
          'created_at',
          {
            ascending: false,
          }
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

    setCurrentUser(user)
  }

  loadUser()
}, [])

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
  className="max-w-[600px] mx-auto px-5 pt-0"
  style={{ paddingBottom: "80px" }}
>

      {/* HEADER */}
      <div className="flex flex-col items-center text-center -mt-4">

       {/* AVATAR */}
<div
  style={{
    position: 'relative',
    width: 96,
    height: 96,
    margin: '24px auto 0',
  }}
>
  <img
    src={
      profile.avatar_url ||
      '/default-avatar.png'
    }
    className="w-24 h-24 rounded-full object-cover"
  />

  {/* EDIT BUTTON — OWNER ONLY */}
  {currentUser?.id === profile.user_id && (
    <button
    id="profile-follow-button"
      onClick={() =>
        router.push('/profile')
      }
      style={{
        position: 'absolute',
        right: -2,
        bottom: -2,

        width: 38,
        height: 38,

        borderRadius: '50%',

        border: '1px solid #E5E7EB',

        background: '#FFFFFF',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        boxShadow:
          '0 4px 14px rgba(0,0,0,0.08)',

        cursor: 'pointer',

        transition:
          'transform 0.15s ease',
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 20H8L18.5 9.5C19.1 8.9 19.1 7.9 18.5 7.3L16.7 5.5C16.1 4.9 15.1 4.9 14.5 5.5L4 16V20Z"
          stroke="#111111"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )}
</div>

        {/* USERNAME */}
        <h2 className="mt-3 text-lg font-semibold">
          @{profile.username}
        </h2>

        {/* NAME */}
        {profile.name && (
          <p className="text-sm text-gray-500">{profile.name}</p>
        )}

        {/* STATS */}
<div className="flex gap-4 mt-3 text-sm text-gray-600">
  <span>🔥 {profile.streak_count || 0}</span>

  
    <span>🥐 {ep}</span>

</div>

        {/* BUTTON */}
        {userId !== profile.user_id && ( 
           <div className="mt-4 flex justify-center">
          <button
          id="profile-follow-button"
  onClick={handleFollow}
  disabled={loadingFollow}
  className={`px-5 py-2 rounded-full text-sm font-medium transition ${
    isFollowing
      ? 'bg-gray-200 text-black'
      : 'bg-black text-white'
  }`}
>
  {loadingFollow
    ? '...'
    : isFollowing
    ? 'Following'
    : 'Follow'}
</button>
</div>
)}
      </div>

      {/* ===================== STATS ===================== */}
<div className="flex justify-center gap-8 mt-6 text-center">

  {/* FRIENDS */}
  <button
    onClick={() => {
      setFollowSheetType('friends')
      setFollowSheetOpen(true)
    }}
    className="flex flex-col items-center"
  >
    <p className="text-lg font-semibold">
      {friendsCount}
    </p>

    <p className="text-xs text-gray-500">
      Friends
    </p>
  </button>

  {/* FOLLOWERS */}
  <button
    onClick={() => {
      setFollowSheetType('followers')
      setFollowSheetOpen(true)
    }}
    className="flex flex-col items-center"
  >
    <p className="text-lg font-semibold">
      {followersCount}
    </p>

    <p className="text-xs text-gray-500">
      Followers
    </p>
  </button>

  {/* FOLLOWING */}
  {userId === profile.user_id && (
    <button
    onClick={() => {
      setFollowSheetType('following')
      setFollowSheetOpen(true)
    }}
    className="flex flex-col items-center"
  >
    
  <div>
    <p className="text-lg font-semibold">{followingCount}</p>
    <p className="text-xs text-gray-500">Following</p>
  </div>

  </button>
)}
</div>

{/* ===================== BIO ===================== */}
{profile.bio && (
  <div className="mt-4 text-center text-sm text-gray-700 px-4">
    {profile.bio}
  </div>
)}

{/* ===================== TABS ===================== */}
<div className="sticky top-0 z-40 bg-[#f5f5f5] border-b">
  <div className="max-w-[600px] mx-auto px-5 flex justify-center gap-8 text-sm font-medium h-[44px] items-end">
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
<div className="mt-4 space-y-3">

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
              (now.getTime() - created.getTime()) / (1000 * 60 * 60)

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

  currentUserId={profile.user_id}

  onDelete={(deletedId) => {
    setQuestions(prev =>
      prev.filter(
        q => q.id !== deletedId
      )
    )
  }}
/>
        ))}
    </>
  ) : (
    <>
      {loadingAnswers && (
        <p className="text-center text-sm text-gray-400">Loading...</p>
      )}

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
        onClick={() => router.push(`/question/${a.question_id}`)}
        className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm hover:shadow-md transition active:scale-[0.98] cursor-pointer"
      >

        {/* HEADER (SAME AS QUESTION CARD) */}
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
              @{profile.username} • {timeAgo(a.created_at)}
            </span>
          </div>
        </div>

        {/* ANSWER TEXT (REPLACES QUESTION TEXT) */}
        <p className="text-base text-black leading-relaxed">
          {a.text}
        </p>

      </div>

    </div>
  ))}

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
/>
    </div>
  )
}