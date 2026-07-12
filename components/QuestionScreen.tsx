'use client'

import {
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { useNavigation } from '@/components/navigation/NavigationProvider'
import AnswerCard from '@/components/AnswerCard'
import LinkPreviewCard from '@/components/LinkPreviewCard'
import QuestionActionsMenu from '@/components/QuestionActionsMenu'
import QuestionCardSkeleton from '@/components/QuestionCardSkeleton'

type Question = {
  id: string
  text: string
  user_id: string
  expires_at: string
  verified?: boolean
  created_at?: string

  user_name?: string
  username?: string
  avatar_url?: string
streak_count?: number
is_verified?: boolean
is_friend?: boolean
hideStreak?: boolean

link_url?: string
  link_title?: string
  link_description?: string
  link_image?: string
  link_domain?: string
  link_type?: string
}

type Reply = {
  id: string
  answer_id: string
  user_id: string
  text: string
  created_at: string

  username?: string
  user_name?: string
  avatar_url?: string
  is_verified?: boolean

  like_count?: number
  liked_by_me?: boolean
}

type Answer = {
  id: string
  text: string
  user_id: string
  question_id: string
  approved: boolean

  created_at?: string

  username?: string
  user_name?: string
  avatar_url?: string

  is_verified?: boolean

  like_count?: number
  liked_by_me?: boolean

  replies?: Reply[]
  reply_count?: number

  _optimistic?: boolean
}

type Props = {
  questionId?: string
  scrollContainer?: React.RefObject<HTMLDivElement | null>
}

export default function QuestionScreen({
  questionId,
}: Props) {
  const params = useParams<{ id: string }>()

  const id =
    questionId ?? params.id
  const router = useRouter()

const {
  replace,
} = useNavigation()

  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [text, setText] = useState('')

const [replyTarget, setReplyTarget] =
  useState<{
    answerId: string
    username: string
  } | null>(null)

const [me, setMe] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] =
  useState(false)
  const PAGE_SIZE = 15

const [page, setPage] = useState(0)

const [hasMore, setHasMore] = useState(true)
const textareaRef =
  useRef<HTMLTextAreaElement>(null)

  // ===============================
// INSTANT PREVIEW CACHE
// ===============================
useEffect(() => {
  if (!id) return

  const cached = sessionStorage.getItem(
    `question-preview-${id}`
  )

  if (cached) {
    try {
      const parsed = JSON.parse(cached)

      setQuestion(parsed)

    } catch {}
  }
}, [id])

useEffect(() => {
  const params = new URLSearchParams(
    window.location.search
  )

  if (params.get('reply') === '1') {
    setTimeout(() => {
      textareaRef.current?.focus()

      textareaRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 250)
  }
}, [])

useEffect(() => {
  const loadAnswers = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: answersData } =
      await supabase
        .from('answers')
        .select(`
          id,
          text,
          user_id,
          question_id,
          approved,
          created_at
        `)
        .eq('question_id', id)
        .order('created_at', {
          ascending: false,
        })
        .range(
          page * PAGE_SIZE,
          page * PAGE_SIZE + PAGE_SIZE - 1
        )

    if (!answersData) return

    const answerIds = answersData.map(a => a.id)

    const [
      { data: replyRows },
      { data: likes },
      { data: myLikes },
    ] = await Promise.all([

      // Only used to calculate reply counts.
      // Individual replies are loaded lazily.
      supabase
  .from('answer_replies')
  .select('answer_id')
  .in('answer_id', answerIds),

      supabase
        .from('answer_likes')
        .select('answer_id'),

      user
        ? supabase
            .from('answer_likes')
            .select('answer_id')
            .in('answer_id', answerIds)
            .eq('user_id', user.id)
        : Promise.resolve({ data: [] }),

    ])

    // ===============================
    // LIKE COUNT
    // ===============================
    const likeCountMap =
      new Map<string, number>()

    ;(likes || []).forEach((l: any) => {
      likeCountMap.set(
        l.answer_id,
        (likeCountMap.get(l.answer_id) || 0) + 1
      )
    })

    const likedSet = new Set(
      (myLikes || []).map(
        (l: any) => l.answer_id
      )
    )

    // ===============================
    // REPLY COUNT
    // ===============================
    const replyCountMap =
      new Map<string, number>()

    ;(replyRows || []).forEach((r: any) => {
      replyCountMap.set(
        r.answer_id,
        (replyCountMap.get(r.answer_id) || 0) + 1
      )
    })

    // ===============================
    // USER PROFILES
    // ===============================
    const answerUserIds = [
      ...new Set(
        answersData.map(a => a.user_id)
      ),
    ]

    const { data: profiles } =
      await supabase
        .from('profiles')
        .select(`
          user_id,
          name,
          username,
          avatar_url,
          is_verified
        `)
        .in(
          'user_id',
          answerUserIds
        )

    const profileMap = new Map(
      (profiles || []).map((p: any) => [
        p.user_id,
        p,
      ])
    )

    // ===============================
    // BUILD ANSWERS
    // ===============================
    const loadedAnswers =
      answersData.map((a: any) => ({
        ...a,

        username:
          profileMap.get(a.user_id)?.username,

        user_name:
          profileMap.get(a.user_id)?.name,

        avatar_url:
          profileMap.get(a.user_id)?.avatar_url,

        is_verified:
          profileMap.get(a.user_id)?.is_verified,

        like_count:
          likeCountMap.get(a.id) || 0,

        liked_by_me:
          likedSet.has(a.id),

        // Replies will be fetched only
        // when the user taps "View replies"
        replies: [],

        reply_count:
          replyCountMap.get(a.id) || 0,
      }))

    // ===============================
    // UPDATE UI
    // ===============================
    setAnswers(prev =>
      page === 0
        ? loadedAnswers
        : [...prev, ...loadedAnswers]
    )

    setHasMore(
      loadedAnswers.length === PAGE_SIZE
    )
  }

  loadAnswers()
}, [id, page])

  // ===============================
  // LOAD QUESTION + ANSWERS
  // ===============================
useEffect(() => {
  let channel: any
let likesChannel: any
let repliesChannel: any

  const load = async () => {
    // 🔥 auth FIRST
    const authRes =
      await supabase.auth.getUser()

    // 🔥 remaining queries in parallel
    const [
      questionRes,
      answersRes,
    ] = await Promise.all([

      supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single(),

      supabase
  .from('answers')
  .select(`
    id,
    text,
    user_id,
    question_id,
    approved,
    created_at
  `)
  .eq('question_id', id)
  .order('created_at', {
    ascending: false,
  })
  .range(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE - 1
  ),

    ])

    const user =
      authRes.data?.user

    setMe(user?.id || null)

    if (questionRes.data) {
  const questionRow =
    questionRes.data

  const { data: profile } = await supabase
  .from('profiles')
  .select(`
    name,
    username,
    avatar_url,
    streak_count,
    is_verified
  `)
  .eq('user_id', questionRow.user_id)
  .single()

let isFriend = false

if (user && user.id !== questionRow.user_id) {
  const { data: followsMe } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', questionRow.user_id)
    .maybeSingle()

  const { data: followsBack } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', questionRow.user_id)
    .eq('following_id', user.id)
    .maybeSingle()

  isFriend = !!(followsMe && followsBack)
}

setQuestion((prev: any) => ({
  ...prev,
  ...questionRow,

  user_name: profile?.name ?? 'Anonymous',
  username: profile?.username ?? 'user',
  avatar_url: profile?.avatar_url ?? null,

  streak_count: profile?.streak_count ?? 0,
  is_verified: profile?.is_verified ?? false,
  is_friend: isFriend,
}))
}

    // 🔥 render everything together
    setLoading(false)

    // 🔥 realtime
    channel = supabase
      .channel('answers-' + id)

      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'answers',
        },
        async payload => {
          const incoming =
            payload.new as Answer

            const {
  data: profile,
} = await supabase
  .from('profiles')
  .select(
  'username,name,avatar_url'
)
  .eq(
  'user_id',
  incoming.user_id
)
  .single()

incoming.username =
  profile?.username

incoming.user_name =
  profile?.name

incoming.avatar_url =
  profile?.avatar_url

          if (
            incoming.question_id !== id
          ) return

          setAnswers(prev => {
            const optimisticIndex =
              prev.findIndex(
                a =>
                  a._optimistic &&
                  a.user_id === incoming.user_id &&
                  a.text === incoming.text
              )

            // 🔥 replace optimistic answer
            if (
              optimisticIndex !== -1
            ) {
              const copy = [...prev]

              copy[optimisticIndex] =
                incoming

              return copy
            }

            // 🔥 prevent duplicates
            if (
              prev.some(
                a =>
                  a.id === incoming.id
              )
            ) {
              return prev
            }

            return [
              ...prev,
              incoming,
            ]
          })
        }
      )

      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'answers',
        },
        payload => {
          const updated =
            payload.new as Answer

          setAnswers(prev =>
            prev.map(a =>
              a.id === updated.id
                ? updated
                : a
            )
          )
        }
      )

           .subscribe()

    // 🔥 Realtime likes
    likesChannel = supabase
      .channel('answer-likes-' + id)

      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answer_likes',
        },
        payload => {
          const row =
            (payload.new || payload.old) as any

          if (!row?.answer_id) return

          setAnswers(prev =>
            prev.map(answer => {
              if (answer.id !== row.answer_id) {
                return answer
              }

              if (payload.eventType === 'INSERT') {
                return {
                  ...answer,
                  like_count:
                    (answer.like_count || 0) + 1,
                  liked_by_me:
                    row.user_id === me
                      ? true
                      : answer.liked_by_me,
                }
              }

              if (payload.eventType === 'DELETE') {
                return {
                  ...answer,
                  like_count: Math.max(
                    0,
                    (answer.like_count || 0) - 1
                  ),
                  liked_by_me:
                    row.user_id === me
                      ? false
                      : answer.liked_by_me,
                }
              }

              return answer
            })
          )
        }
      )

      .subscribe()
      repliesChannel = supabase
  .channel('answer-replies-' + id)

  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'answer_replies',
    },
    async payload => {
      const reply = payload.new as Reply

      const { data: profile } =
        await supabase
          .from('profiles')
          .select(`
            username,
            name,
            avatar_url,
            is_verified
          `)
          .eq('user_id', reply.user_id)
          .single()

      const fullReply: Reply = {
        ...reply,

        username: profile?.username,
        user_name: profile?.name,
        avatar_url: profile?.avatar_url,
        is_verified: profile?.is_verified,

        like_count: 0,
        liked_by_me: false,
      }

      setAnswers(prev =>
  prev.map(answer => {
    if (answer.id !== reply.answer_id) {
      return answer
    }

    const alreadyExists =
      answer.replies?.some(
        r => r.id === fullReply.id
      ) ?? false

    return {
      ...answer,

      reply_count: alreadyExists
        ? answer.reply_count
        : (answer.reply_count || 0) + 1,

      replies: answer.replies
        ? alreadyExists
          ? answer.replies
          : [...answer.replies, fullReply]
        : answer.replies,
    }
  })
)
    
    }
  )

  .subscribe()
  }

  load()

  return () => {
  if (channel) {
    supabase.removeChannel(channel)
  }

  if (likesChannel) {
  supabase.removeChannel(likesChannel)
}

if (repliesChannel) {
  supabase.removeChannel(repliesChannel)
}
}
}, [id])

  // ===============================
  // DERIVED STATE
  // ===============================
  const approvedAnswer = answers.find(a => a.approved)

const newestAnswers = useMemo(() => {
  return answers
    .filter(a => !a.approved)
    .sort((a, b) => {
      return (
        new Date(b.created_at ?? '').getTime() -
        new Date(a.created_at ?? '').getTime()
      )
    })
}, [answers])

const orderedAnswers = useMemo(() => {
  return approvedAnswer
    ? [approvedAnswer, ...newestAnswers]
    : newestAnswers
}, [approvedAnswer, newestAnswers])

  const isClosed = Boolean(approvedAnswer)

  // ===============================
  // SUBMIT ANSWER (OPTIMISTIC)
  // ===============================
 const submitAnswer = async () => {
  if (!text.trim()) return
  if (posting) return

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user

  if (!user) return

  // ==========================
  // REPLY MODE
  // ==========================
  if (replyTarget) {
  const cleanText = text.trim()

  // Clear UI immediately
  setText('')
  setReplyTarget(null)
  setPosting(true)

  const { data: insertedReply, error } =
    await supabase
      .from('answer_replies')
      .insert({
        answer_id: replyTarget.answerId,
        user_id: user.id,
        text: cleanText,
      })
      .select()
      .single()

  setPosting(false)

  if (error || !insertedReply) {
    console.error(error)
    return
  }

  const { data: profile } =
    await supabase
      .from('profiles')
      .select(`
        username,
        name,
        avatar_url,
        is_verified
      `)
      .eq('user_id', user.id)
      .single()

     const newReply: Reply = {
  ...insertedReply,

  username: profile?.username,
  user_name: profile?.name,
  avatar_url: profile?.avatar_url,
  is_verified: profile?.is_verified,

  like_count: 0,
  liked_by_me: false,
}

setAnswers(prev =>
  prev.map(answer => {
    if (answer.id !== replyTarget.answerId) {
      return answer
    }

    return {
      ...answer,

      // ✅ Update reply count immediately
      reply_count: (answer.reply_count || 0) + 1,

      // ✅ Only append if replies are already loaded/open
      replies: answer.replies
        ? [...answer.replies, newReply]
        : answer.replies,
    }
  })
)


// ===============================
// NOTIFY ANSWER OWNER
// ===============================
const { data: answerOwner } = await supabase
  .from('answers')
  .select('user_id')
  .eq('id', replyTarget.answerId)
  .single()

if (
  answerOwner &&
  answerOwner.user_id !== user.id
) {
  await supabase
    .from('notifications')
    .insert({
      user_id: answerOwner.user_id,
      actor_id: user.id,

      type: 'answer_reply',

      answer_id: replyTarget.answerId,

      message:
        cleanText.length > 80
          ? `${cleanText.slice(0, 80)}...`
          : cleanText,

      link: `/question/${id}`,

      is_read: false,
    })

  try {
    await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify({
        userId: answerOwner.user_id,
        title: '💬 New reply',
        message:
          'Someone replied to your answer.',
        url: `/question/${id}`,
      }),
    })
  } catch {}
}

setReplyTarget(null)
setText('')

return
}

  // ==========================
  // NORMAL ANSWER
  // ==========================
  setPosting(true)

  const optimisticAnswer: Answer = {
    id: `temp-${Date.now()}`,
    text,
    user_id: user.id,
    question_id: id,
    approved: false,
    _optimistic: true,
  }

  setAnswers(prev => [...prev, optimisticAnswer])
  setText('')

  try {
    const { error } = await supabase
      .from('answers')
      .insert({
        text,
        user_id: user.id,
        question_id: id,
      })

    if (error) {
      setAnswers(prev =>
        prev.filter(a => a.id !== optimisticAnswer.id)
      )
      console.error('Insert error:', error)
      return
    }

    // ✅ RESET UI IMMEDIATELY
    setPosting(false)

    await supabase.rpc('update_streak', { u_id: user.id })
    
    // 🔔 PUSH (safe)
   if (question && question.user_id !== user?.id) {
  try {
    await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: question.user_id,
        title: '💬 New answer',
        message: 'New activity on your question',
        url: `/question/${id}`,
      }),
    })

    // 🔔 ALSO INSERT IN-APP NOTIFICATION
    const { data: insertedAnswer } = await supabase
  .from('answers')
  .select('id')
  .eq('question_id', id)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .single()

await supabase.from('notifications').insert({
  user_id: question.user_id,
  actor_id: user.id,

  type: 'answer',

  answer_id: insertedAnswer?.id,

  message:
    text.length > 80
      ? `${text.slice(0, 80)}...`
      : text,

  link: `/question/${id}`,
  is_read: false,
})

  } catch (err) {
    console.error('Push error:', err)
  }
}

  } catch (err) {
    console.error('Submit error:', err)

    // rollback optimistic
    setAnswers(prev =>
      prev.filter(a => a.id !== optimisticAnswer.id)
    )
  } finally {
    // ✅ ALWAYS RESET
    setPosting(false)
  }
}
  // ===============================
  // SAFE RENDER
  // ===============================
if (loading) {
  return (
    <div
      style={{
        minHeight: '100%',
        background: '#f5f5f5',
        padding: '72px 16px 100px',
        boxSizing: 'border-box',
      }}
    >
      <QuestionCardSkeleton />
    </div>
  )
}

if (!question) {
  return null
}

return (
  <div
  style={{
    padding: '72px 16px 12px',
  }}
>
    <div
  style={{
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(88vh - 72px)',
  }}
>

{/* QUESTION FEED CARD */}
<div
  style={{
    borderBottom:
      'none',
    position: 'relative',
  }}
>
  {/* HEADER */}
  <div
    style={{
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
    }}
  >
    {/* AVATAR */}
    <div
  onClick={() => {
    if (question.username) {
      replace(`/u/${question.username}`)
    }
  }}
  style={{
    width: 42,
    height: 42,
    borderRadius: '50%',
    backgroundImage: `url(${
      question.avatar_url ||
      '/avatar.png'
    })`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    flexShrink: 0,
    cursor: 'pointer',
  }}
/>

    <div
      style={{
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* NAME + MENU */}
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div
  onClick={() => {
    if (question.username) {
      replace(`/u/${question.username}`)
    }
  }}
  style={{
    cursor: 'pointer',
    width: 'fit-content',
  }}
>
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: '#0F1419',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>
  {question.user_name || 'Anonymous'}
</span>

{question.is_verified && (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      transform: 'translateY(1px)',
    }}
  >
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
    >
      <path
        fill="#1D9BF0"
        d="M12 2.5L13.8 4.2L16.2 3.8L17 6.2L19.4 7L19 9.4L20.5 11.5L19 13.6L19.4 16L17 16.8L16.2 19.2L13.8 18.8L12 20.5L10.2 18.8L7.8 19.2L7 16.8L4.6 16L5 13.6L3.5 11.5L5 9.4L4.6 7L7 6.2L7.8 3.8L10.2 4.2Z"
      />
      <path
        d="M8.6 11.7l2.4 2.4 4.8-4.8"
        fill="none"
        stroke="#FFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
)}

{!question.hideStreak &&
  (question.is_friend || question.user_id === me) &&
  (question.streak_count ?? 0) > 0 && (
    <span
  style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    width: 28,
    height: 28,
    flexShrink: 0,
    transform: "translateY(-4px)",
  }}
>
  <svg
    width="28"
    height="28"
    viewBox="0 0 64 64"
    fill="none"
  >
    {/* Sparkles */}
    <circle cx="9" cy="14" r="2.5" fill="#FFD54A" />
    <circle cx="55" cy="15" r="2.5" fill="#FFD54A" />
    <circle cx="12" cy="50" r="2.2" fill="#FFD54A" />
    <circle cx="52" cy="48" r="2.2" fill="#FFD54A" />

    {/* Flame */}
    <path
      d="M32 4
         C42 12 49 22 49 33
         C49 47 41 58 32 58
         C21 58 13 48 13 35
         C13 25 19 18 25 12
         C25 22 32 24 32 4Z"
      fill="#FF7A1A"
    />

    {/* Inner Flame */}
    <path
      d="M32 16
         C38 22 42 28 42 35
         C42 43 37 50 32 50
         C26 50 22 44 22 37
         C22 31 25 27 29 23
         C29 29 32 31 32 16Z"
      fill="#FFC547"
    />

    {/* White Badge */}
    <circle
      cx="32"
      cy="39"
      r="10.5"
      fill="#FFF"
    />

    {/* Orange Border */}
    <circle
      cx="32"
      cy="39"
      r="9.5"
      fill="none"
      stroke="#FF8A24"
      strokeWidth="2"
    />

    {/* Number */}
    <text
      x="32"
      y="43.5"
      textAnchor="middle"
      fontSize="16"
      fontWeight="900"
      fill="#F97316"
      fontFamily="Inter, sans-serif"
    >
      {question.streak_count}
    </text>
  </svg>
</span>
)}
          </div>

          <div
            style={{
              fontSize: 13,
              color: '#71767B',
              marginTop: 2,
            }}
          >
            @
            {question.username ||
              'user'}
            {' • '}
            {question.created_at
  ? new Date(
      question.created_at
    ).toLocaleDateString(
      'en-US',
      {
        month: 'numeric',
        day: 'numeric',
      }
    )
  : ''}
          </div>
        </div>

        {/* REAL MENU */}
        <div
          style={{
            position: 'relative',
          }}
        >
          <button
  data-question-menu-button
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMenu(prev => !prev)
  }}
  style={{
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    width: 32,
    height: 32,
    borderRadius: '50%',
    color: '#6B7280',
  }}
>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle
                cx="5"
                cy="12"
                r="1.8"
              />
              <circle
                cx="12"
                cy="12"
                r="1.8"
              />
              <circle
                cx="19"
                cy="12"
                r="1.8"
              />
            </svg>
          </button>

          {showMenu && (
            <div
              style={{
                position:
                  'absolute',
                top: 36,
                right: 0,
                zIndex: 9999,
              }}
            >
              <QuestionActionsMenu
                onClose={() =>
                  setShowMenu(
                    false
                  )
                }
                isOwner={
                  question.user_id ===
                  me
                }
                questionId={
                  question.id
                }
              />
            </div>
          )}
        </div>
      </div>
      </div>
      </div></div>

      {/* QUESTION TEXT */}
<div
  style={{
    marginTop: 8,
  }}
>
  <p
    style={{
      margin: 0,

      fontSize: '17px',

      fontFamily:
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI Emoji", "Apple Color Emoji", sans-serif',

      letterSpacing: '-0.15px',

      lineHeight: 1.82,

      fontWeight: 400,

      color: '#0F1419',

      whiteSpace: 'pre-wrap',

      wordBreak: 'break-word',

      overflowWrap: 'break-word',
    }}
  >
    {question.text
      .split(
        /(https?:\/\/[^\s]+|www\.[^\s]+)/g
      )
      .map((part, index) => {
        const isLink =
          /^(https?:\/\/|www\.)/.test(
            part
          )

        if (isLink) {
          const href =
            part.startsWith('http')
              ? part
              : `https://${part}`

          return (
            <span
              key={index}
              onClick={() => {
                sessionStorage.setItem(
                  'ep_inapp_browser',
                  href
                )

                router.push(
                  `/browser?url=${encodeURIComponent(
                    href
                  )}`
                )
              }}
              style={{
                color: '#1D9BF0',
                cursor: 'pointer',
              }}
            >
              {part}
            </span>
          )
        }

        return (
          <span key={index}>
            {part}
          </span>
        )
      })}
  </p>
</div>

{/* LINK CARD */}
{question.link_url && (
  <div
    style={{
      marginTop: 12,
    }}
  >
    <LinkPreviewCard
      url={question.link_url}
      title={question.link_title}
      description={question.link_description}
      image={question.link_image}
      domain={question.link_domain}
      type={question.link_type}
    />
  </div>
)}

<div
  style={{
    position: 'relative',
    marginTop: 18,
    marginBottom: 10,
  }}
>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      width: '100%',
    }}
  >
    <div
      style={{
        flex: 1,
        height: 1,
        background: '#ECEFF3',
      }}
    />

    <span
      style={{
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: 500,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      Replies
    </span>

    <div
      style={{
        flex: 1,
        height: 1,
        background: '#ECEFF3',
      }}
    />
  </div>
</div>
        {/* ANSWERS */}
<div
  style={{
    flex: 1,
    overflowY: 'auto',
    paddingBottom:
  answers.length === 0 ? '90px' : '140px',
  }}
>
  {answers.length === 0 && (
    <div
      style={{
        textAlign: 'center',
        padding: '32px 12px',
        color: '#6B7280',
        fontSize: 14,
      }}
    >
      Be the first to reply
    </div>
  )}
          {orderedAnswers.map((a, i) => (
  <div key={a.id}>
    <AnswerCard
  answer={a}
  isAsker={question.user_id === me}
  isLast={i === orderedAnswers.length - 1}
  currentUserId={me}
  questionId={question.id}
  onReply={(answerId, username) => {
  const value = `@${username} `

  setReplyTarget({
    answerId,
    username,
  })

  setText(value)

  requestAnimationFrame(() => {
    textareaRef.current?.focus()

    textareaRef.current?.setSelectionRange(
      value.length,
      value.length
    )
  })
}}
  onDelete={async (answerId) => {
    const previousAnswers = [...answers]

    setAnswers(prev =>
      prev.filter(a => a.id !== answerId)
    )

    const { error } = await supabase
      .from('answers')
      .delete()
      .eq('id', answerId)

    if (error) {
      console.error(error)
      setAnswers(previousAnswers)
    }
  }}
/>

    {i !== orderedAnswers.length - 1 && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          margin: '6px 0 2px',
          opacity: 0.6,
        }}
      >
        <div
          style={{
            width: 338,
            height: 1,
            background: '#E5E7EB',
          }}
        />
      </div>
    )}
  </div>
))}

{hasMore && (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '18px 0',
    }}
  >
    <button
      onClick={() => setPage(p => p + 1)}
      style={{
        border: '1px solid #E5E7EB',
        background: '#fff',
        borderRadius: 999,
        padding: '10px 18px',
        fontSize: 14,
        color: '#374151',
        cursor: 'pointer',
      }}
    >
      Load more answers
    </button>
  </div>
)}
        </div>

{answers.length === 2 && (
  <div
    style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: '76px', // sits just above answer bar
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 19,
      transition: 'opacity .2s ease',
    }}
  >
    <div
      style={{
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 1.4,
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      Love EggPuff?{' '}
      <span
        onClick={() => router.push('/feedback')}
        style={{
          color: '#111827',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'opacity .15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.7'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
      >
        Rate it.
      </span>
    </div>
  </div>
)}

{replyTarget && (
  <div
    style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 62,
      background: '#F9FAFB',
      borderTop: '1px solid #E5E7EB',
      padding: '10px 14px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 20,
    }}
  >
    <span
      style={{
        fontSize: 13,
        color: '#6B7280',
      }}
    >
      Replying to @{replyTarget.username}
    </span>

    <button
      onClick={() => {
  setReplyTarget(null)
  setText('')
}}
      style={{
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: '#6B7280',
        fontSize: 18,
      }}
    >
      ✕
    </button>
  </div>
)}

        {/* INPUT SECTION */}
        <div
  style={{
    position: 'fixed',
    paddingBottom: 'env(safe-area-inset-bottom)',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'white',
    padding: '10px 12px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    zIndex: 20,
  }}
>
  <textarea
  ref={textareaRef}
  value={
  replyTarget
    ? text.replace(
        `@${replyTarget.username}`,
        ''
      ).trimStart()
    : text
}
onChange={(e) => {
  const value = e.target.value

  if (replyTarget) {
    setText(
      `@${replyTarget.username} ${value}`
    )
  } else {
    setText(value)
  }
}}
placeholder="Write your answer..."
  rows={1}
  style={{
    flex: 1,
    padding: '10px 12px',
    borderRadius: 20,
    border: '1px solid #ddd',
    outline: 'none',
    resize: 'none',
    overflow: 'hidden',
  }}
/>

  <button
    onClick={submitAnswer}
    disabled={posting}
    style={{
  background: '#E9B25D',
  border: 'none',
  padding: '8px 14px',
  borderRadius: 18,
  fontWeight: 600,
  fontSize: 15,
  minWidth: 88,
  height: 42,
  cursor: posting ? 'default' : 'pointer',
}}
  >
    {posting ? '...' : 'Answer'}
  </button>
</div>

        {/* CLOSED STATE */}
        {isClosed && (
          <p
            style={{
              marginTop: 22,
              color: '#16a34a',
              fontWeight: 500,
            }}
          >
            🔒 Question closed
          </p>
        )}

      </div>
    </div>
  )
}