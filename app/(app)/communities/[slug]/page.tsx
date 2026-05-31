'use client'

import {
  useEffect,
  useState,
  useRef,
} from 'react'

import {
  useParams,
  useRouter,
} from 'next/navigation'

import { supabase }
  from '@/lib/supabase'

export default function CommunityPage() {

  const router =
    useRouter()

  const params =
    useParams()

  const slug =
    params?.slug as string

  const [loading,
    setLoading] =
      useState(true)

  const [community,
    setCommunity] =
      useState<any>(null)

  const [posts,
    setPosts] =
      useState<any[]>([])

  const [postText,
  setPostText] =
    useState('')

  const [selectedPost,
  setSelectedPost] =
    useState<any>(null)

  const [replyText,
  setReplyText] =
    useState('')

const [sendingReply,
  setSendingReply] =
    useState(false)

const [replies,
  setReplies] =
    useState<any[]>([])

const [sending,
  setSending] =
    useState(false)

  const [joined,
    setJoined] =
      useState(false)

  const [isOwner,
    setIsOwner] =
     useState(false)

    const feedRef =
  useRef<HTMLDivElement>(null)

  // ─────────────────────────────
  // LOAD
  // ─────────────────────────────

  useEffect(() => {

    const load =
      async () => {

        setLoading(true)

        const {
          data: { session }
        } =
          await supabase
            .auth
            .getSession()

        const userId =
          session?.user?.id

        // COMMUNITY

        const {
          data: communityData
        } =
          await supabase

            .from(
              'communities'
            )

            .select('*')

            .eq(
              'slug',
              slug
            )

            .single()

        if (!communityData) {

          router.push(
            '/communities'
          )

          return
        }

        // STORAGE URLS

        const avatarUrl =
          communityData.avatar_url

            ? supabase.storage

                .from(
                  'community-avatars'
                )

                .getPublicUrl(
                  communityData.avatar_url
                )

                .data.publicUrl

            : ''

        const bannerUrl =
          communityData.banner_url

            ? supabase.storage

                .from(
                  'community-banners'
                )

                .getPublicUrl(
                  communityData.banner_url
                )

                .data.publicUrl

            : ''

        setCommunity({

          ...communityData,

          avatar_url:
            avatarUrl,

          banner_url:
            bannerUrl,
        })

        // JOIN CHECK

const owner =

  communityData.owner_id ===
    userId

  ||

  communityData.created_by ===
    userId

// OWNER STATE

setIsOwner(
  owner
)

// OWNER = ALWAYS JOINED

if (owner) {

  setJoined(true)

} else if (userId) {

  // MEMBER CHECK

  const {
    data: member,
    error,
  } =
    await supabase

      .from(
        'community_members'
      )

      .select('*')

      .eq(
        'community_id',
        communityData.id
      )

      .eq(
        'user_id',
        userId
      )

      .maybeSingle()

  if (error) {

    console.warn(error)
  }

  const alreadyJoined =
    !!member

  setJoined(
    alreadyJoined
  )
}

        // POSTS

        const {
  data: questionData
} =
  await supabase

    .from(
      'questions'
    )

    .select(`
      id,
      text,
      created_at,
      user_id
    `)

    .eq(
      'community_id',
      communityData.id
    )

    .order(
      'created_at',
      {
        ascending: true,
      }
    )

if (!questionData) {

  setPosts([])

} else {

  // USER IDS

  const userIds =
    questionData.map(
      (q) => q.user_id
    )

  // PROFILES

  const {
    data: profiles
  } =
    await supabase

      .from('profiles')

      .select(`
        id,
        username,
        avatar_url
      `)

      .in(
        'id',
        userIds
      )

  // MERGE

  const formatted =
    questionData.map((q) => ({

      ...q,

      profiles:
        profiles?.find(
          (p) =>
            p.id === q.user_id
        ),
    }))

  setPosts(formatted)
}

        setLoading(false)
      }

    load()

  }, [slug, router])

useEffect(() => {

  if (!feedRef.current)
    return

  requestAnimationFrame(() => {

    if (!feedRef.current)
      return

    feedRef.current.scrollTo({

      top:
        feedRef.current.scrollHeight,

      behavior:
        'instant' as ScrollBehavior,
    })
  })

}, [posts])

  // ─────────────────────────────
  // JOIN
  // ─────────────────────────────

  const handleJoin =
  async () => {

    if (
      !community
    ) return

    try {

      const {
        data: { session }
      } =
        await supabase
          .auth
          .getSession()

      const userId =
        session?.user?.id

      if (!userId)
        return

      // JOIN COMMUNITY

      const {
        error
      } =
        await supabase

          .from(
            'community_members'
          )

          .upsert(

            {
              community_id:
                community.id,

              user_id:
                userId,
            },

            {
              onConflict:
                'community_id,user_id',
            }
          )

      if (error) {

        console.warn(error)

        return
      }

      // INSTANT UI UPDATE

      setJoined(true)

      setCommunity((prev: any) =>

        prev

          ? {

              ...prev,

              members_count:
                (prev.members_count || 0) + 1,
            }

          : prev
      )

    } catch (e) {

      console.warn(e)
    }
  }


   // ─────────────────────────────
// CREATE POST
// ─────────────────────────────

const handleCreatePost =
  async () => {

    if (
      !postText.trim() ||
      !community ||
      sending
    ) return

    try {

      setSending(true)

      const {
        data: { session }
      } =
        await supabase
          .auth
          .getSession()

      const userId =
        session?.user?.id

      if (!userId) return

      // CURRENT USER PROFILE

      const {
        data: profile
      } =
        await supabase

          .from('profiles')

          .select(`
            name,
            username,
            avatar_url
          `)

          .eq(
            'id',
            userId
          )

          .single()

      // INSERT POST

      const {
        data,
        error,
      } =
        await supabase

          .from(
            'questions'
          )

          .insert({

            text:
              postText.trim(),

            user_id:
              userId,

            community_id:
              community.id,
          })

          .select()

          .single()

      if (error) {

        console.warn(error)

        return
      }

      // UI OBJECT

      const newPost = {

        ...data,

        profiles:
          profile,
      }

      // INSTANT UI UPDATE

      setPosts((prev) => [

        ...prev,

       newPost,
      ])

      // ─────────────────────────────
// SEND NOTIFICATIONS
// ─────────────────────────────

const {
  data: members
} =
  await supabase

    .from(
      'community_members'
    )

    .select(`
      user_id
    `)

    .eq(
      'community_id',
      community.id
    )

if (members?.length) {

  const notificationRows =

    members

      .filter(
        (m) =>
          m.user_id !== userId
      )

      .map((member) => ({

        user_id:
          member.user_id,

        actor_id:
          userId,

        type:
          'community_post',

        community_id:
          community.id,

        message:
          `${community.name} posted: ${postText.trim()}`,

        link:
          `/communities/${community.slug}`,
      }))

  if (
    notificationRows.length
  ) {

    await supabase

      .from(
        'notifications'
      )

      .insert(
        notificationRows
      )
  }
}

      // CLEAR INPUT

      setPostText('')

    } finally {

      setSending(false)
    }
  }

  // ─────────────────────────────
// SEND REPLY
// ─────────────────────────────

const handleSendReply =
  async () => {

    if (
      !replyText.trim() ||
      !selectedPost ||
      sendingReply
    ) return

    try {

      setSendingReply(true)

      const {
        data: { session }
      } =
        await supabase
          .auth
          .getSession()

      const userId =
        session?.user?.id

      if (!userId) return

      // PROFILE

      const {
        data: profile
      } =
        await supabase

          .from('profiles')

          .select(`
            username,
            avatar_url
          `)

          .eq(
            'id',
            userId
          )

          .single()

      // INSERT

      const {
        data,
        error
      } =
        await supabase

          .from(
  'answers'
)

          .insert({

            question_id:
              selectedPost.id,

            user_id:
              userId,

            text:
              replyText.trim(),
          })

          .select()

          .single()

      if (error) {

  console.log(error)

  alert(
    JSON.stringify(error)
  )

  return
}

      // UI UPDATE

      const newReply = {

        ...data,

        profiles:
          profile,
      }

      setReplies((prev) => [

        ...prev,

        newReply,
      ])

      setReplyText('')

    } finally {

      setSendingReply(false)
    }
  }

  useEffect(() => {

  if (!selectedPost)
    return

  const loadReplies =
  async () => {

    // LOAD REPLIES

    const {
      data: repliesData,
      error,
    } =
      await supabase

        .from('answers')

        .select(`
          id,
          text,
          created_at,
          user_id,
          question_id
        `)

        .eq(
          'question_id',
          selectedPost.id
        )

        .order(
          'created_at',
          {
            ascending: true,
          }
        )

    if (error) {

      console.warn(error)

      return
    }

    if (!repliesData) {

      setReplies([])

      return
    }

    // USER IDS

    const userIds =
      repliesData.map(
        (r) => r.user_id
      )

    // LOAD PROFILES

    const {
      data: profiles
    } =
      await supabase

        .from('profiles')

        .select(`
          id,
          username,
          avatar_url
        `)

        .in(
          'id',
          userIds
        )

    // MERGE

    const formatted =
      repliesData.map((reply) => ({

        ...reply,

        profiles:
          profiles?.find(
            (p) =>
              p.id ===
              reply.user_id
          ),
      }))

    setReplies(
      formatted
    )
  }

  loadReplies()

}, [selectedPost?.id])


  // ─────────────────────────────
// LOADING
// ─────────────────────────────

if (loading) {

  return (

    <div
      style={{
        height: '100vh',

        background: '#EFE7DD',

        overflow: 'hidden',

        position: 'relative',
      }}
    >

      {/* SHIMMER */}

      <style jsx>{`

        @keyframes skeletonShimmer {

          0% {
            background-position: -200% 0;
          }

          100% {
            background-position: 200% 0;
          }
        }

      `}</style>

      {/* TOP BAR */}

      <div
        style={{
          position: 'fixed',

          top: 0,
          left: 0,
          right: 0,

          height: 78,

          display: 'flex',

          alignItems: 'center',

          justifyContent:
            'space-between',

          paddingLeft: 16,
          paddingRight: 16,

          background:
            'rgba(239,231,221,0.78)',

          backdropFilter:
            'blur(18px)',

          WebkitBackdropFilter:
            'blur(18px)',

          borderBottom:
            '1px solid rgba(15,23,42,0.06)',

          zIndex: 20,
        }}
      >

        {/* LEFT */}

        <div
          style={{
            display: 'flex',

            alignItems: 'center',

            gap: 12,
          }}
        >

          {/* BACK */}

          <div
            style={{
              width: 34,
              height: 34,

              borderRadius: 999,

              background:
                'linear-gradient(90deg,#E7E1D8 25%,#F5F1EB 50%,#E7E1D8 75%)',

              backgroundSize:
                '200% 100%',

              animation:
                'skeletonShimmer 1.6s infinite linear',
            }}
          />

          {/* AVATAR */}

          <div
            style={{
              width: 54,
              height: 54,

              borderRadius: 999,

              background:
                'linear-gradient(90deg,#E7E1D8 25%,#F5F1EB 50%,#E7E1D8 75%)',

              backgroundSize:
                '200% 100%',

              animation:
                'skeletonShimmer 1.6s infinite linear',
            }}
          />

          {/* TEXT */}

          <div>

            <div
              style={{
                width: 140,
                height: 18,

                borderRadius: 999,

                background:
                  'linear-gradient(90deg,#E7E1D8 25%,#F5F1EB 50%,#E7E1D8 75%)',

                backgroundSize:
                  '200% 100%',

                animation:
                  'skeletonShimmer 1.6s infinite linear',
              }}
            />

            <div
              style={{
                marginTop: 10,

                width: 90,
                height: 12,

                borderRadius: 999,

                background:
                  'linear-gradient(90deg,#E7E1D8 25%,#F5F1EB 50%,#E7E1D8 75%)',

                backgroundSize:
                  '200% 100%',

                animation:
                  'skeletonShimmer 1.6s infinite linear',
              }}
            />

          </div>

        </div>

      </div>

      {/* FEED */}

      <div
        style={{
          paddingTop: 100,

          paddingLeft: 16,
          paddingRight: 16,

          paddingBottom: 140,
        }}
      >

        {[1, 2, 3].map((item) => (

          <div
            key={item}

            style={{
              marginBottom: 36,
            }}
          >

            {/* AVATAR */}

            <div
              style={{
                width: 42,
                height: 42,

                borderRadius: 999,

                background:
                  'linear-gradient(90deg,#E7E1D8 25%,#F5F1EB 50%,#E7E1D8 75%)',

                backgroundSize:
                  '200% 100%',

                animation:
                  'skeletonShimmer 1.6s infinite linear',
              }}
            />

            {/* CARD */}

            <div
              style={{
                marginTop: -10,

                marginLeft: 56,

                borderRadius: 34,

                padding: 22,

                background:
                  'rgba(255,255,255,0.26)',

                border:
                  '1px solid rgba(255,255,255,0.42)',
              }}
            >

              <div
                style={{
                  width: '78%',
                  height: 20,

                  borderRadius: 999,

                  background:
                    'linear-gradient(90deg,#E7E1D8 25%,#F5F1EB 50%,#E7E1D8 75%)',

                  backgroundSize:
                    '200% 100%',

                  animation:
                    'skeletonShimmer 1.6s infinite linear',
                }}
              />

              <div
                style={{
                  marginTop: 16,

                  width: '52%',
                  height: 20,

                  borderRadius: 999,

                  background:
                    'linear-gradient(90deg,#E7E1D8 25%,#F5F1EB 50%,#E7E1D8 75%)',

                  backgroundSize:
                    '200% 100%',

                  animation:
                    'skeletonShimmer 1.6s infinite linear',
                }}
              />

            </div>

            {/* REACTIONS */}

            <div
              style={{
                marginTop: 12,

                marginLeft: 84,

                display: 'flex',

                gap: 10,
              }}
            >

              {[1, 2, 3, 4].map((r) => (

                <div
                  key={r}

                  style={{
                    width: 68,
                    height: 42,

                    borderRadius: 999,

                    background:
                      'linear-gradient(90deg,#E7E1D8 25%,#F5F1EB 50%,#E7E1D8 75%)',

                    backgroundSize:
                      '200% 100%',

                    animation:
                      'skeletonShimmer 1.6s infinite linear',
                  }}
                />

              ))}

            </div>

          </div>

        ))}

      </div>

      {/* BOTTOM */}

      <div
        style={{
          position: 'fixed',

          left: 0,
          right: 0,
          bottom: 0,

          paddingTop: 12,
          paddingBottom: 18,
          paddingLeft: 20,
          paddingRight: 20,

          background:
            'rgba(239,231,221,0.92)',

          borderTop:
            '1px solid rgba(15,23,42,0.06)',
        }}
      >

        <div
          style={{
            width: 240,
            height: 14,

            borderRadius: 999,

            margin: '0 auto',

            background:
              'linear-gradient(90deg,#E7E1D8 25%,#F5F1EB 50%,#E7E1D8 75%)',

            backgroundSize:
              '200% 100%',

            animation:
              'skeletonShimmer 1.6s infinite linear',
          }}
        />

      </div>

    </div>
  )
}

  // ─────────────────────────────
  // UI
  // ─────────────────────────────

  return (

  <div
    style={{
      height: '100vh',

      background:
        '#EFE7DD',

      position: 'relative',

      overflow: 'hidden',

      marginTop: -70,

      paddingTop: 0,

      display: 'flex',

      flexDirection: 'column',
    }}
  >

      {/* BLUR BACKGROUND */}

      {community.banner_url && (

        <img
          src={
            community.banner_url
          }

          style={{
            position: 'fixed',

            inset: 0,

            width: '100%',
            height: '100%',

            objectFit: 'cover',

            filter:
              'blur(24px)',

            transform:
              'scale(1.12)',

            opacity: 0.22,

            pointerEvents:
              'none',
          }}
        />

      )}

      {/* TOP BAR */}

<div
  style={{
    position: 'fixed',

    top: 0,
    left: 0,
    right: 0,

    zIndex: 999,

    height: 78,

    display: 'flex',

    alignItems: 'center',

    justifyContent:
      'space-between',

    paddingLeft: 16,
    paddingRight: 16,

    background:
  'rgba(239,231,221,0.78)',

    backdropFilter:
      'blur(18px)',

    WebkitBackdropFilter:
      'blur(18px)',

    borderBottom:
      '1px solid rgba(15,23,42,0.06)',

    flexShrink: 0,
  }}
>

        {/* LEFT */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >

          <button

            onClick={() =>
              router.back()
            }

            style={{
              border: 'none',

              background:
                'transparent',

              fontSize: 34,

              cursor: 'pointer',

              color: '#111827',
            }}
          >
            ←
          </button>

          <img
            src={
              community.avatar_url ||
              '/default-avatar.png'
            }

            style={{
              width: 54,
              height: 54,

              borderRadius: 999,

              objectFit: 'cover',

              border:
                '2px solid rgba(255,255,255,0.8)',
            }}
          />

          <div>

            <div
              style={{
                fontSize: 18,

                fontWeight: 800,

                color: '#111827',

                maxWidth: 180,

                overflow: 'hidden',

                textOverflow:
                  'ellipsis',

                whiteSpace:
                  'nowrap',
              }}
            >
              {community.name}
            </div>

            <div
              style={{
                marginTop: 2,

                color: '#64748B',

                fontSize: 14,

                fontWeight: 500,
              }}
            >
              {community.members_count || 0}
              {' '}
              members
            </div>

          </div>

        </div>

        {/* RIGHT 

        <button
          style={{
            border: 'none',

            background:
              'transparent',

            fontSize: 34,

            cursor: 'pointer',

            color: '#111827',
          }}
        >
          🔕
        </button> */}

      </div>
      {/* DIVIDER */}

<div
  style={{
    height: 1,

    width: '100%',

    background:
      'rgba(15,23,42,0.06)',

    flexShrink: 0,
  }}
/>

     {/* FEED */}

<div

  ref={feedRef}

  className="hide-scrollbar"

  style={{
    flex: 1,

    overflowY: 'auto',

    paddingBottom: 160,

    paddingTop: 96,

    background: '#EFE7DD',

    overscrollBehavior: 'none',

    WebkitOverflowScrolling:
      'touch',

    scrollbarWidth: 'none',

    msOverflowStyle: 'none',
  }}
>

        {/* PINNED */}

{posts.length === 0 && (

  <div
          style={{
            margin:
              '0 16px 22px',

            padding: 18,

            borderRadius: 28,

            background:
              'rgba(255,255,255,0.42)',

            backdropFilter:
              'blur(16px)',

            border:
              '1px solid rgba(255,255,255,0.5)',
          }}
        >

          <div
            style={{
              fontSize: 15,

              fontWeight: 700,

              color: '#111827',
            }}
          >
            📌 Welcome to {community.name}
          </div>

          <div
            style={{
              marginTop: 10,

              fontSize: 15,

              lineHeight: '28px',

              color: '#475569',
            }}
          >
            Community updates and
            posts
            will appear here.
          </div>

       </div>

)}

        {/* POSTS */}

        {posts.map((post) => (

          <div
            key={post.id}

            style={{
              marginBottom: 28,
            }}
          >

            {/* AVATAR */}

<div
  style={{
    padding:
      '0 16px',
  }}
>

  <img
    src={
      post.profiles
        ?.avatar_url ||
      '/default-avatar.png'
    }

    style={{
      width: 42,
      height: 42,

      borderRadius: 999,

      objectFit: 'cover',

      border:
        '2px solid rgba(255,255,255,0.75)',

      display: 'block',
    }}
  />

</div>

           {/* CARD */}

<div

  onClick={() => {

  setSelectedPost(post)
}}

  style={{
    marginTop: -10,

    marginLeft: 62,
    marginRight: 18,

                borderRadius: 34,

                cursor: 'pointer',

                overflow: 'hidden',

                background:
                  'rgba(255,255,255,0.28)',

                backdropFilter:
                  'blur(16px)',

                border:
                  '1px solid rgba(255,255,255,0.45)',
              }}
            >

              <div
                style={{
                  padding: 22,

                  fontSize: 18,

                  lineHeight: '34px',

                  color: '#111827',

                  fontWeight: 600,
                }}
              >
                {post.text}
              </div>

            </div>

            {/* REACTIONS 

<div
  style={{
    marginTop: 10,

    marginLeft: 84,

                display: 'flex',
                gap: 10,
              }}
            >

              {[
                '❤️',
                '🔥',
                '👏',
                '😮',
              ].map((emoji) => (

                <div
                  key={emoji}

                  style={{
                    height: 42,

                    padding:
                      '0 16px',

                    borderRadius:
                      999,

                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',

                    background:
                      'rgba(255,255,255,0.32)',

                    backdropFilter:
                      'blur(10px)',

                    border:
                      '1px solid rgba(255,255,255,0.5)',

                    fontSize: 18,
                  }}
                >
                  {emoji}
                </div>

              ))}

            </div>*/}

          </div>

        ))}

      </div>

      {/* BOTTOM ACTION */}

<div
  style={{
    position: 'fixed',

    left: 0,
    right: 0,
    bottom: 0,

    zIndex: 100,
  }}
>

  {!joined && !isOwner ? (

    <div
      style={{
        padding:
          '0 20px 24px',
      }}
    >

      <button

        onClick={
          handleJoin
        }

        style={{
          width: '100%',

          height: 62,

          borderRadius:
            999,

          border: 'none',

          background:
            '#FFFFFF',

          backdropFilter:
            'blur(18px)',

          WebkitBackdropFilter:
            'blur(18px)',

          boxShadow:
            '0 10px 30px rgba(0,0,0,0.12)',

          fontSize: 17,

          fontWeight: 800,

          color: '#111827',

          cursor: 'pointer',
        }}
      >
        Join Community
      </button>

    </div>

  ) : (

    <div
      style={{
        width: '100%',

        background:
          'rgba(239,231,221,0.92)',

        backdropFilter:
          'blur(18px)',

        WebkitBackdropFilter:
          'blur(18px)',

        borderTop:
          '1px solid rgba(15,23,42,0.06)',

        boxShadow:
          '0 -10px 30px rgba(0,0,0,0.06)',

        paddingTop: 12,
        paddingBottom: 18,
        paddingLeft: 20,
        paddingRight: 20,

        boxSizing:
          'border-box',
      }}
    >

 {/* TEXT */}

<div
  style={{
    fontSize: 12,

    lineHeight: '18px',

    fontWeight: 500,

    color: '#64748B',

    textAlign: 'center',

    maxWidth: 280,

    margin: '0 auto',
  }}
>

  View{' '}

  <a
    href="/community-guidelines"
    target="_blank"
    rel="noopener noreferrer"

    style={{
      color: '#2563EB',

      textDecoration: 'underline',

      textUnderlineOffset: 2,

      cursor: 'pointer',
    }}
  >
    community guidelines
  </a>

  . Be respectful,
  avoid spam,
  and keep the
  community safe.

</div>

</div>

  )}

</div>

      {/* OWNER COMPOSER */}

{isOwner && (

  <div
    style={{
      position: 'fixed',

      left: 0,
      right: 0,

      bottom: 24,

      zIndex: 120,

      padding: '0 20px',
    }}
  >

    <div
      style={{
        display: 'flex',

        alignItems: 'center',

        gap: 12,

        height: 64,

        paddingLeft: 20,
        paddingRight: 10,

        borderRadius: 999,

        background:
          'rgba(255,255,255,0.88)',

        backdropFilter:
          'blur(18px)',

        WebkitBackdropFilter:
          'blur(18px)',

        border:
          '1px solid rgba(255,255,255,0.55)',

        boxShadow:
          '0 10px 30px rgba(0,0,0,0.10)',
      }}
    >

      {/* INPUT */}

      <input

  value={postText}

  onChange={(e) =>
    setPostText(
      e.target.value
    )
  }

  placeholder="Write something..."

        style={{
          flex: 1,

          border: 'none',

          outline: 'none',

          background:
            'transparent',

          fontSize: 16,

          color: '#111827',
        }}
      />

      {/* SEND */}

      <button

  onClick={
    handleCreatePost
  }

  disabled={
    sending
  }

  style={{
          width: 44,
          height: 44,

          borderRadius: 999,

          border: 'none',

          background: '#F4C542',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          cursor: 'pointer',

          flexShrink: 0,
        }}
      >

        {sending ? (

  <div
    style={{
      fontSize: 12,

      fontWeight: 700,

      color: '#111827',
    }}
  >
    ...
  </div>

) : (

  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#111827"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >

    <path d="M12 19V5" />

    <path d="M5 12l7-7 7 7" />

  </svg>

)}

      </button>

    </div>

  </div>

)}

{/* POST MODAL */}

{selectedPost && (

  <div
    onClick={() =>
      setSelectedPost(null)
    }

    style={{
      position: 'fixed',

      inset: 0,

      zIndex: 9999,

      background:
        'rgba(0,0,0,0.34)',

      backdropFilter:
        'blur(10px)',

      WebkitBackdropFilter:
        'blur(10px)',

      display: 'flex',

      alignItems: 'flex-end',

      justifyContent: 'center',

      overflow: 'hidden',
    }}
  >

    {/* SHEET */}

    <div

      onClick={(e) =>
        e.stopPropagation()
      }

      className="hide-scrollbar"

      style={{
        width: '100%',

        maxWidth: 680,

        height: '92dvh',

        overflowY: 'auto',

        overflowX: 'hidden',

        borderTopLeftRadius: 34,
        borderTopRightRadius: 34,

        background: '#EFE7DD',

        paddingBottom:
          'calc(env(safe-area-inset-bottom) + 120px)',

        animation:
          'slideUp .22s ease',

        WebkitOverflowScrolling:
          'touch',

        scrollbarWidth: 'none',

        msOverflowStyle: 'none',

        position: 'relative',
      }}
    >

      {/* HANDLE */}

      <div
        style={{
          position: 'sticky',

          top: 0,

          zIndex: 20,

          paddingTop: 14,

          paddingBottom: 12,

          background:
            'linear-gradient(to bottom,#EFE7DD 78%,transparent)',
        }}
      >

        <div
          style={{
            width: 42,
            height: 5,

            borderRadius: 999,

            background:
              'rgba(15,23,42,0.12)',

            margin: '0 auto',
          }}
        />

      </div>

      {/* HEADER */}

      <div
        style={{
          paddingLeft: 20,
          paddingRight: 20,

          display: 'flex',
          alignItems: 'center',

          gap: 14,

          width: '100%',

          boxSizing: 'border-box',
        }}
      >

        <img
          src={
            selectedPost
              .profiles
              ?.avatar_url ||

            '/default-avatar.png'
          }

          alt="User avatar"

          draggable={false}

          style={{
            width: 54,
            height: 54,

            minWidth: 54,

            borderRadius: 999,

            objectFit: 'cover',

            display: 'block',

            background: '#F1F5F9',

            flexShrink: 0,
          }}
        />

        <div
          style={{
            minWidth: 0,

            flex: 1,
          }}
        >

          <div
            style={{
              fontWeight: 800,

              fontSize: 17,

              color: '#111827',

              overflow: 'hidden',

              textOverflow: 'ellipsis',

              whiteSpace: 'nowrap',
            }}
          >
            {
              selectedPost
                .profiles
                ?.username
            }
          </div>

          <div
            style={{
              marginTop: 2,

              fontSize: 13,

              color: '#64748B',
            }}
          >
            Community Post
          </div>

        </div>

      </div>

      {/* CONTENT */}

      <div
        style={{
          padding:
            '26px 22px 0',

          width: '100%',

          boxSizing: 'border-box',
        }}
      >

        <div
          style={{
            fontSize:
              'clamp(24px, 5vw, 32px)',

            lineHeight:
              'clamp(40px, 7vw, 50px)',

            fontWeight: 700,

            color: '#111827',

            wordBreak: 'break-word',

            overflowWrap: 'break-word',
          }}
        >
          {selectedPost.text}
        </div>

      </div>

      {/* REPLIES */}

      <div
        style={{
          marginTop: 42,

          paddingLeft: 20,
          paddingRight: 20,

          paddingBottom: 40,

          width: '100%',

          boxSizing: 'border-box',
        }}
      >

        <div
          style={{
            fontSize: 18,

            fontWeight: 800,

            color: '#111827',
          }}
        >
          Replies
        </div>

        {/* REPLIES LIST */}

{replies.length === 0 ? (

  <div
    style={{
      marginTop: 18,

      padding: 24,

      borderRadius: 24,

      background:
        'rgba(255,255,255,0.55)',

      textAlign: 'center',

      color: '#64748B',

      fontSize: 15,
    }}
  >
    No replies yet.
  </div>

) : (

  <div
    style={{
      marginTop: 18,

      display: 'flex',

      flexDirection: 'column',

      gap: 18,
    }}
  >

    {replies.map((reply) => (

      <div
        key={reply.id}

        style={{
          display: 'flex',

          gap: 12,

          alignItems: 'flex-start',
        }}
      >

        {/* AVATAR */}

        <img
          src={
            reply.profiles
              ?.avatar_url ||

            '/default-avatar.png'
          }

          style={{
            width: 42,
            height: 42,

            borderRadius: 999,

            objectFit: 'cover',

            flexShrink: 0,

            border:
              '2px solid rgba(255,255,255,0.7)',
          }}
        />

        {/* REPLY CARD */}

        <div
          style={{
            flex: 1,

            padding: 16,

            borderRadius: 22,

            background:
              'rgba(255,255,255,0.58)',

            backdropFilter:
              'blur(12px)',

            WebkitBackdropFilter:
              'blur(12px)',

            border:
              '1px solid rgba(255,255,255,0.45)',

            boxShadow:
              '0 4px 20px rgba(0,0,0,0.04)',

            overflow: 'hidden',
          }}
        >

          {/* USERNAME */}

          <div
            style={{
              fontWeight: 700,

              fontSize: 14,

              color: '#111827',

              overflow: 'hidden',

              textOverflow:
                'ellipsis',

              whiteSpace:
                'nowrap',
            }}
          >
            {
              reply.profiles
                ?.username
            }
          </div>

          {/* TEXT */}

          <div
            style={{
              marginTop: 8,

              fontSize: 15,

              lineHeight: '28px',

              color: '#334155',

              wordBreak:
                'break-word',
            }}
          >
            {reply.text}
          </div>

        </div>

      </div>

    ))}

  </div>

)}

      {/* FIXED REPLY BAR */}

<div
  style={{
    position: 'fixed',

    left: 0,
    right: 0,

    bottom: 0,

    zIndex: 99999,

    display: 'flex',

    justifyContent: 'center',

    pointerEvents: 'none',
  }}
>

  <div
    style={{
      width: '100%',

      maxWidth: 680,

      paddingLeft: 18,
      paddingRight: 18,

      paddingTop: 12,

      paddingBottom:
        'calc(env(safe-area-inset-bottom) + 12px)',

      background:
        'linear-gradient(to top,#EFE7DD 75%,transparent)',

      backdropFilter:
        'blur(16px)',

      WebkitBackdropFilter:
        'blur(16px)',

      pointerEvents: 'auto',
    }}
  >

    <div
      style={{
        display: 'flex',

        alignItems: 'center',

        gap: 12,

        minHeight: 58,

        borderRadius: 999,

        background:
          'rgba(255,255,255,0.96)',

        border:
          '1px solid rgba(255,255,255,0.7)',

        boxShadow:
          '0 8px 24px rgba(0,0,0,0.08)',

        paddingLeft: 20,
        paddingRight: 10,
      }}
    >

      {/* INPUT */}

      <input

  value={replyText}

  onChange={(e) =>
    setReplyText(
      e.target.value
    )
  }

  placeholder="Reply..."

        enterKeyHint="send"

        style={{
          flex: 1,

          border: 'none',

          outline: 'none',

          background:
            'transparent',

          fontSize: 16,

          color: '#111827',

          height: 48,

          WebkitAppearance:
            'none',
        }}
      />

      {/* SEND */}

      <button

  onClick={
    handleSendReply
  }

  disabled={
    sendingReply
  }

  style={{
          width: 42,
          height: 42,

          minWidth: 42,

          borderRadius: 999,

          border: 'none',

          background: '#F4C542',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          cursor: 'pointer',

          flexShrink: 0,
        }}
      >

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#111827"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >

          <path d="M12 19V5" />

          <path d="M5 12l7-7 7 7" />

        </svg>

      </button>

    </div>

  </div>

</div>
</div>
  </div>
</div>
)}

    </div>

  )
}