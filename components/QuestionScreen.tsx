'use client'

import {
  useEffect,
  useState,
  useMemo,
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

  created_at?: string

  user_name?: string
  username?: string
  avatar_url?: string

  streak_count?: number

  link_url?: string
  link_title?: string
  link_description?: string
  link_image?: string
  link_domain?: string
  link_type?: string
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
  const [me, setMe] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] =
  useState(false)

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

  // ===============================
  // LOAD QUESTION + ANSWERS
  // ===============================
useEffect(() => {
  let channel: any

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
    ascending: true,
  }),

    ])

    const user =
      authRes.data?.user

    setMe(user?.id || null)

    if (questionRes.data) {
  const questionRow =
    questionRes.data

  const { data: profile } =
    await supabase
      .from('profiles')
      .select(`
        name,
        username,
        avatar_url,
        streak_count
      `)
      .eq(
        'user_id',
        questionRow.user_id
      )
      .maybeSingle()

  setQuestion((prev: any) => ({
    ...prev,
    ...questionRow,

    user_name:
      profile?.name ||
      'Anonymous',

    username:
      profile?.username ||
      'user',

    avatar_url:
      profile?.avatar_url ||
      null,

    streak_count:
      profile?.streak_count ?? 0,
  }))
}

const answersData =
  answersRes.data || []

const answerUserIds = [
  ...new Set(
    answersData.map(
      (a: any) => a.user_id
    )
  ),
]

const { data: profiles } =
  await supabase
    .from('profiles')
    .select(`
      user_id,
      username,
      name,
      avatar_url
    `)
    .in(
      'user_id',
      answerUserIds
    )

const profileMap = new Map(
  (profiles || []).map(
    (p: any) => [
      p.user_id,
      p,
    ]
  )
)

setAnswers(
  answersData.map(
    (a: any) => ({
      ...a,

      username:
        profileMap.get(
          a.user_id
        )?.username,

      user_name:
        profileMap.get(
          a.user_id
        )?.name,

      avatar_url:
        profileMap.get(
          a.user_id
        )?.avatar_url,
    })
  )
)

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
  }

  load()

  return () => {
    if (channel) {
      supabase.removeChannel(
        channel
      )
    }
  }
}, [id])

  // ===============================
  // DERIVED STATE
  // ===============================
  const approvedAnswer = answers.find(a => a.approved)
  const normalAnswers = answers.filter(a => !a.approved)

  const orderedAnswers = useMemo(() => {
    return approvedAnswer
      ? [approvedAnswer, ...normalAnswers]
      : normalAnswers
  }, [approvedAnswer, normalAnswers])

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
    await supabase.from('notifications').insert({
      user_id: question.user_id,
      actor_id: user?.id,
      type: 'answer',
      message: 'answered your question',
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
      padding: '72px 16px 100px',
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '100vh',
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
            {question.user_name ||
              'Anonymous'}

            {(question.streak_count ?? 0) > 0 && (
  <span>
    🔥{question.streak_count}
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
            onClick={(e) => {
              e.stopPropagation()

              setShowMenu(
                !showMenu
              )
            }}
            style={{
              border: 'none',
              background:
                'transparent',
              cursor: 'pointer',
              width: 32,
              height: 32,
              borderRadius:
                '50%',
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

        {/* ANSWERS */}
<div
  style={{
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '120px',
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
      Be the first to reply 👇
    </div>
  )}
          {orderedAnswers.map((a, i) => (
  <AnswerCard
  key={a.id}
  answer={a}
  isAsker={
    question.user_id === me
  }
  isLast={
    i ===
    orderedAnswers.length - 1
  }
  currentUserId={me}
  questionId={question.id}
/>
))}
        </div>
{/* 🔥 DIVIDER */}
  <div
    style={{
      height: 1,
      background: 'linear-gradient(to right, transparent, #E5E7EB, transparent)',
      marginBottom: 12,
      opacity: 0.6,
    }}
  />
        <div
  style={{
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    margin: '12px 0',
  }}
>
  Love EggPuff?{' '}
  <span
    onClick={() => {
  router.push('/feedback')
}}
    style={{
      fontWeight: 600,
      color: '#111827',
      cursor: 'pointer',
    }}
  >
    Rate it ⭐
  </span>
</div>

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
  value={text}
  onChange={(e) => setText(e.target.value)}
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
      padding: '10px 16px',
      borderRadius: '20px',
      fontWeight: 600,
      cursor: 'pointer',
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

        <div style={{ marginTop: 24 }}>

  

</div>

      </div>
    </div>
  )
}