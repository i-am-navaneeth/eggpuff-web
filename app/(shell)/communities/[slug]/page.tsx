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
import { useNotify } from '@/components/NotificationProvider'

export default function CommunityPage() {

  const router =
    useRouter()

  const { notify } = useNotify()

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

const [alertsEnabled,
  setAlertsEnabled] =
    useState(false)

const [updatingAlerts,
  setUpdatingAlerts] =
    useState(false)

// COMMUNITY ALERTS

const [activeAlert,
  setActiveAlert] =
    useState<any>(null)

const [alertText,
  setAlertText] =
    useState('')

const [sendingAlert,
  setSendingAlert] =
    useState(false)

const [showAlertComposer,
  setShowAlertComposer] =
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

// COMMUNITY ALERTS STATE

setAlertsEnabled(
  !!communityData.alerts_enabled
)

// LOAD ACTIVE COMMUNITY ALERT

const {
  data: currentAlert,
  error: alertError,
} =
  await supabase

    .from('community_alerts')

    .select(`
      id,
      community_id,
      user_id,
      title,
      description,
      created_at,
      expires_at
    `)

    .eq(
      'community_id',
      communityData.id
    )

    .gt(
      'expires_at',
      new Date().toISOString()
    )

    .order(
      'created_at',
      {
        ascending: false,
      }
    )

    .limit(1)
    .maybeSingle()

if (alertError) {

  console.warn(
    'Failed to load community alert:',
    alertError
  )

} else {

  setActiveAlert(
    currentAlert || null
  )
}

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
// TOGGLE COMMUNITY ALERTS
// ─────────────────────────────

const handleToggleAlerts =
  async () => {

    if (
      !community ||
      !isOwner ||
      updatingAlerts
    ) return

    const nextValue =
      !alertsEnabled

    try {

      setUpdatingAlerts(true)

      // INSTANT UI UPDATE

      setAlertsEnabled(
        nextValue
      )

      const {
        error
      } =
        await supabase

          .from(
            'communities'
          )

          .update({

            alerts_enabled:
              nextValue,

          })

          .eq(
            'id',
            community.id
          )

      if (error) {

        console.error(
          'Failed to update community alerts:',
          error
        )

        // ROLLBACK

        setAlertsEnabled(
          !nextValue
        )

        notify(
          '❌ Failed to update alerts'
        )

        return
      }

      notify(
  nextValue
    ? '📣 Community alerts are on — members can now send temporary alerts.'
    : 'Community alerts are off — members can no longer send alerts.'
)

    } catch (error) {

      console.error(
        error
      )

      setAlertsEnabled(
        !nextValue
      )

      notify(
        '❌ Something went wrong'
      )

    } finally {

      setUpdatingAlerts(
        false
      )
    }
  }

  // ─────────────────────────────
// CREATE COMMUNITY ALERT
// ─────────────────────────────

const handleCreateAlert =
  async () => {

    if (
      !community ||
      !joined ||
      !alertsEnabled ||
      !alertText.trim() ||
      sendingAlert
    ) return

    try {

      setSendingAlert(true)

      const {
        data: { session }
      } =
        await supabase
          .auth
          .getSession()

      const userId =
        session?.user?.id

      if (!userId) {

        notify(
          'Please log in to send an alert.'
        )

        return
      }

      // CREATE THROUGH RPC
      // SERVER-SIDE AUTHORIZATION SHOULD
      // VERIFY MEMBERSHIP + ALERT ENABLED

            const {
        data,
        error
      } =
        await supabase

          .rpc(
            'create_community_alert',
            {
              p_community_id:
                community.id,

              p_title:
                'Community Alert',

              p_description:
                alertText.trim(),
            }
          )

if (error) {

  // ─────────────────────────────
  // EXPECTED COOLDOWN
  // ─────────────────────────────

  if (error.code === 'P0001') {

    // Close the composer first so
    // the notification cannot appear
    // behind the alert sheet.

    setAlertText('')

    setShowAlertComposer(false)

    notify(
      '⏳ Please wait before sending another alert.'
    )

    return
  }

  // ─────────────────────────────
  // REAL / UNEXPECTED ERROR
  // ─────────────────────────────

  console.error(
    '❌ FAILED TO CREATE COMMUNITY ALERT'
  )

  console.error(
    'RPC error:',
    JSON.stringify(
      error,
      Object.getOwnPropertyNames(error),
      2
    )
  )

  console.error(
    'RPC error message:',
    error?.message
  )

  console.error(
    'RPC error code:',
    error?.code
  )

  console.error(
    'RPC error details:',
    error?.details
  )

  console.error(
    'RPC error hint:',
    error?.hint
  )

  // Close the sheet before showing
  // the error notification.

  setAlertText('')

  setShowAlertComposer(false)

  notify(
    `❌ ${
      error?.message ||
      error?.details ||
      'Unable to send alert.'
    }`
  )

  return
}

           // RPC MAY RETURN THE CREATED ALERT

      const createdAlert =
        Array.isArray(data)
          ? data[0]
          : data

      if (createdAlert) {

        setActiveAlert(
          createdAlert
        )
      }

      // ─────────────────────────────
// SEND IN-APP + BROWSER PUSH
// ─────────────────────────────

const {
  data: members,
  error: membersError,
} =
  await supabase
    .from('community_members')
    .select(`
      user_id
    `)
    .eq(
      'community_id',
      community.id
    )

if (membersError) {

  console.warn(
    'Failed to load community members for notifications:',
    membersError
  )

} else if (members?.length) {

  // Never notify the person
  // who created the alert.
  const recipients =
    members.filter(
      (member) =>
        member.user_id !== userId
    )

  // ─────────────────────────────
  // 1. IN-APP NOTIFICATIONS
  // ─────────────────────────────

  const notificationRows =
    recipients.map(
      (member) => ({

        user_id:
          member.user_id,

        actor_id:
          userId,

        type:
          'community_alert',

        community_id:
          community.id,

        message:
          `${community.name}: ${alertText.trim()}`,

        link:
          `/communities/${community.slug}`,

        is_read:
          false,

      })
    )

  if (
    notificationRows.length
  ) {

    const {
      error:
        notificationError,
    } =
      await supabase
        .from('notifications')
        .insert(
          notificationRows
        )

    if (notificationError) {

      console.warn(
        'Failed to create in-app community alert notifications:',
        notificationError
      )

    }
  }

  // ─────────────────────────────
  // 2. BROWSER PUSH NOTIFICATIONS
  // ─────────────────────────────

  await Promise.allSettled(

    recipients.map(
      async (member) => {

        try {

          const response =
            await fetch(
              '/api/push/send',
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json',
                },

                body:
                  JSON.stringify({

                    userId:
                      member.user_id,

                    title:
                      `📣 ${community.name}`,

                    message:
                      alertText.trim(),

                    url:
                      `/communities/${community.slug}`,

                  }),
              }
            )

          if (!response.ok) {

            console.warn(
              'Community alert push failed for:',
              member.user_id
            )

          }

        } catch (pushError) {

          console.warn(
            'Community alert push error:',
            pushError
          )

        }

      }
    )

  )
}

      setAlertText('')

      setShowAlertComposer(false)

      notify(
        '📣 Community alert sent!'
      )

    } catch (error) {

      console.error(
        error
      )

      notify(
        '❌ Something went wrong.'
      )

    } finally {

      setSendingAlert(false)
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
  console.error(error)

  notify(
    `❌ ${error.message ?? 'Something went wrong.'}`
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

      // ─────────────────────────────
      // NOTIFY COMMUNITY POST OWNER
      // ─────────────────────────────

      const {
        data: postOwner,
        error: postOwnerError,
      } = await supabase
        .from('questions')
        .select('user_id')
        .eq('id', selectedPost.id)
        .single()

      if (
        !postOwnerError &&
        postOwner &&
        postOwner.user_id !== userId
      ) {

        const replyMessage =
          replyText.trim()

        const {
          error: notificationError,
        } = await supabase
          .from('notifications')
          .insert({
            user_id:
              postOwner.user_id,

            actor_id:
              userId,

            type:
              'community_reply',

            community_id:
              community.id,

            message:
              `${community.name}: Someone replied to your post${
                replyMessage
                  ? ` — ${replyMessage}`
                  : ''
              }`,

            link:
              `/communities/${community.slug}`,
          })

        if (notificationError) {
          console.warn(
            'Failed to notify community post owner:',
            notificationError
          )
        }

        // ─────────────────────────────
        // BROWSER PUSH
        // ─────────────────────────────

        try {

          await fetch(
            '/api/push/send',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  userId:
                    postOwner.user_id,

                  title:
                    '💬 New reply to your post',

                  message:
                    replyMessage
                      ? replyMessage
                      : 'Someone replied to your community post.',

                  url:
                    `/communities/${community.slug}`,
                }),
            }
          )

        } catch (pushError) {

          console.warn(
            'Community reply push error:',
            pushError
          )
        }
      }

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
// REALTIME COMMUNITY ALERTS
// ─────────────────────────────

useEffect(() => {

  if (!community?.id)
    return

  const channel =
    supabase
      .channel(
        `community-alerts-${community.id}`
      )

      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_alerts',
          filter:
            `community_id=eq.${community.id}`,
        },
        (payload) => {

          const newAlert =
            payload.new

          // IGNORE EXPIRED ALERTS

          if (
            newAlert.expires_at &&
            new Date(
              newAlert.expires_at
            ).getTime() <= Date.now()
          ) {
            return
          }

          // DISPLAY IMMEDIATELY

          setActiveAlert(
            newAlert
          )

          // NOTIFICATION

          notify(
            `📣 ${newAlert.description}`
          )
        }
      )

      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_alerts',
          filter:
            `community_id=eq.${community.id}`,
        },
        (payload) => {

          const updatedAlert =
            payload.new

          if (
            updatedAlert.expires_at &&
            new Date(
              updatedAlert.expires_at
            ).getTime() <= Date.now()
          ) {

            setActiveAlert(
              null
            )

            return
          }

          setActiveAlert(
            updatedAlert
          )
        }
      )

      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'community_alerts',
          filter:
            `community_id=eq.${community.id}`,
        },
        (payload) => {

          if (
            activeAlert?.id ===
            payload.old?.id
          ) {

            setActiveAlert(
              null
            )
          }
        }
      )

      .subscribe()

  return () => {

    supabase.removeChannel(
      channel
    )
  }

}, [
  community?.id,
  notify,
  activeAlert?.id,
])

// ─────────────────────────────
// ALERT EXPIRY CLEANUP
// ─────────────────────────────

useEffect(() => {

  if (
    !activeAlert?.expires_at
  ) return

  const expiresAt =
    new Date(
      activeAlert.expires_at
    ).getTime()

  const remaining =
    expiresAt - Date.now()

  if (remaining <= 0) {

    setActiveAlert(null)

    return
  }

  const timer =
    window.setTimeout(() => {

      setActiveAlert(null)

    }, remaining)

  return () => {

    window.clearTimeout(
      timer
    )
  }

}, [
  activeAlert?.id,
  activeAlert?.expires_at,
])

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

                padding: '22px 22px 46px',

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

    marginTop: 0,

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

  {isOwner && (
  <button
    onClick={handleToggleAlerts}
    disabled={updatingAlerts}
    aria-label={
      alertsEnabled
        ? 'Disable community alerts'
        : 'Enable community alerts'
    }
    title={
      alertsEnabled
        ? 'Community alerts enabled'
        : 'Enable community alerts'
    }
    style={{
      width: 54,
      height: 54,

      borderRadius: 999,

      border: alertsEnabled
        ? '1px solid rgba(244,197,66,0.45)'
        : '1px solid rgba(15,23,42,0.08)',

      background: alertsEnabled
        ? 'rgba(244,197,66,0.18)'
        : 'rgba(255,255,255,0.52)',

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      cursor: updatingAlerts
        ? 'default'
        : 'pointer',

      opacity: updatingAlerts
        ? 0.65
        : 1,

      transition:
        'all 0.2s ease',

      flexShrink: 0,

      boxShadow: alertsEnabled
        ? '0 4px 14px rgba(244,197,66,0.14)'
        : 'none',
    }}
  >
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Megaphone body */}
      <path
        d="M4.5 10.2V13.8C4.5 14.35 4.95 14.8 5.5 14.8H7.2L9.1 19H11.1L9.45 14.8H11.8L18.8 18V6L11.8 9.8H5.5C4.95 9.8 4.5 10.25 4.5 10.8V10.2Z"
        stroke={
          alertsEnabled
            ? '#9A6700'
            : '#94A3B8'
        }
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sound wave */}
      {alertsEnabled && (
        <>
          <path
            d="M20 9C20.7 9.75 21.1 10.7 21.1 12C21.1 13.3 20.7 14.25 20 15"
            stroke="#9A6700"
            strokeWidth="1.7"
            strokeLinecap="round"
          />

          <path
            d="M18.1 10.3C18.45 10.75 18.65 11.3 18.65 12C18.65 12.7 18.45 13.25 18.1 13.7"
            stroke="#9A6700"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  </button>
)}

{!isOwner &&
  joined &&
  alertsEnabled && (

    <button
      onClick={() =>
        setShowAlertComposer(
          true
        )
      }

      aria-label="Send community alert"
      title="Send community alert"

      style={{
        width: 54,
        height: 54,

        borderRadius: 999,

        border:
          '1px solid rgba(244,197,66,0.45)',

        background:
          'rgba(244,197,66,0.18)',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        cursor: 'pointer',

        flexShrink: 0,

        boxShadow:
          '0 4px 14px rgba(244,197,66,0.14)',
      }}
    >

      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >

        <path
          d="M4.5 10.2V13.8C4.5 14.35 4.95 14.8 5.5 14.8H7.2L9.1 19H11.1L9.45 14.8H11.8L18.8 18V6L11.8 9.8H5.5C4.95 9.8 4.5 10.25 4.5 10.8V10.2Z"
          stroke="#9A6700"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M20 9C20.7 9.75 21.1 10.7 21.1 12C21.1 13.3 20.7 14.25 20 15"
          stroke="#9A6700"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M18.1 10.3C18.45 10.75 18.65 11.3 18.65 12C18.65 12.7 18.45 13.25 18.1 13.7"
          stroke="#9A6700"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

      </svg>

    </button>
)}

      </div>
      {/* 📌 PINNED COMMUNITY ALERT */}

{activeAlert &&
  (
    activeAlert.description ||
    activeAlert.body ||
    activeAlert.message ||
    activeAlert.title
  ) && (

  <div
    style={{
      position: 'fixed',

      top: 78,
      left: 0,
      right: 0,

      zIndex: 998,

      padding: '8px 12px',

      background:
        'rgba(239,231,221,0.82)',

      backdropFilter:
        'blur(18px)',

      WebkitBackdropFilter:
        'blur(18px)',

      borderBottom:
        '1px solid rgba(15,23,42,0.06)',
    }}
  >

    <div
      style={{
        width: '100%',

        boxSizing: 'border-box',

        padding: '10px 14px',

        borderRadius: 18,

        background:
          'rgba(244,197,66,0.18)',

        border:
          '1px solid rgba(244,197,66,0.38)',

        boxShadow:
          '0 4px 14px rgba(0,0,0,0.05)',

        display: 'flex',

        alignItems: 'center',

        gap: 10,
      }}
    >

      {/* 📣 ICON */}

      <div
        style={{
          width: 30,
          height: 30,

          minWidth: 30,

          borderRadius: 999,

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          background:
            'rgba(244,197,66,0.28)',

          fontSize: 15,
        }}
      >
        📣
      </div>

      {/* TEXT */}

      <div
        style={{
          minWidth: 0,

          flex: 1,
        }}
      >

        <div
          style={{
            fontSize: 11,

            lineHeight: '14px',

            fontWeight: 800,

            color: '#9A6700',

            letterSpacing: '0.3px',

            textTransform: 'uppercase',
          }}
        >
          Community Alert
        </div>

        <div
  style={{
    marginTop: 2,

    fontSize: 14,

    lineHeight: '20px',

    fontWeight: 700,

    color: '#111827',

    display: '-webkit-box',

    WebkitBoxOrient: 'vertical',

    WebkitLineClamp: 2,

    overflow: 'hidden',

    wordBreak: 'break-word',

    overflowWrap: 'anywhere',
  }}
>
  {activeAlert.description ||
    activeAlert.body ||
    activeAlert.message ||
    activeAlert.title}
</div>

      </div>

    </div>

  </div>
)}
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

    paddingTop: 110,

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

    position: 'relative',

    background:
      'rgba(255,255,255,0.28)',

    backdropFilter:
      'blur(16px)',

    border:
      '1px solid rgba(255,255,255,0.45)',
  }}
>
  {/* POST TEXT */}
  <div
    style={{
      padding: '22px 22px 42px',

      fontSize: 18,

      lineHeight: '34px',

      color: '#111827',

      fontWeight: 600,

      wordBreak: 'break-word',

      overflowWrap: 'break-word',
    }}
  >
    {post.text}
  </div>

  {/* POST TIME */}
  <div
    style={{
      position: 'absolute',

      right: 20,

      bottom: 14,

      fontSize: 12,

      fontWeight: 500,

      color: '#64748B',

      lineHeight: '16px',

      whiteSpace: 'nowrap',

      pointerEvents: 'none',
    }}
  >
    {new Date(post.created_at).toLocaleTimeString([], {
      hour: 'numeric',

      minute: '2-digit',

      hour12: true,
    })}
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

{/* MEMBER ALERT COMPOSER */}

{showAlertComposer && (
  <div
    style={{
      position: 'fixed',

      inset: 0,

      zIndex: 9998,

      background:
        'rgba(0,0,0,0.30)',

      backdropFilter:
        'blur(10px)',

      WebkitBackdropFilter:
        'blur(10px)',

      display: 'flex',

      alignItems: 'flex-end',

      justifyContent: 'center',
    }}

    onClick={() =>
      setShowAlertComposer(false)
    }
  >

    <div
      onClick={(e) =>
        e.stopPropagation()
      }

      style={{
        width: '100%',

        maxWidth: 680,

        padding:
          '24px 20px calc(env(safe-area-inset-bottom) + 24px)',

        borderTopLeftRadius: 32,

        borderTopRightRadius: 32,

        background:
          '#EFE7DD',

        boxShadow:
          '0 -10px 40px rgba(0,0,0,0.14)',
      }}
    >

      <div
        style={{
          fontSize: 20,

          fontWeight: 800,

          color: '#111827',
        }}
      >
        📣 Send a community alert
      </div>

      <div
        style={{
          marginTop: 6,

          fontSize: 13,

          lineHeight: '20px',

          color: '#64748B',
        }}
      >
        This is a temporary alert for
        members of this community.
      </div>

     <div
  style={{
    marginTop: 18,
  }}
>
  {/* INPUT */}
  <input
    type="text"
    value={alertText}

    onChange={(e) => {
      setAlertText(
        e.target.value.slice(0, 60)
      )
    }}

    onKeyDown={(e) => {
      // Never allow Enter.
      if (e.key === 'Enter') {
        e.preventDefault()
      }
    }}

    placeholder="What's happening?"

    maxLength={60}

    autoFocus

    autoComplete="off"
    autoCorrect="off"
    autoCapitalize="sentences"
    spellCheck={false}

    style={{
      width: '100%',

      height: 54,

      padding: '0 16px',

      borderRadius: 22,

      border:
        '1px solid rgba(15,23,42,0.08)',

      outline: 'none',

      background: '#FFFFFF',

      fontSize: 16,

      lineHeight: '24px',

      color: '#111827',

      fontFamily: 'inherit',

      boxSizing: 'border-box',

      whiteSpace: 'nowrap',

      overflow: 'hidden',

      textOverflow: 'ellipsis',

      display: 'block',
    }}
  />

  {/* CHARACTER COUNTER */}
  <div
    style={{
      marginTop: 6,

      paddingRight: 6,

      textAlign: 'right',

      fontSize: 11,

      lineHeight: '14px',

      fontWeight: 600,

      color:
        alertText.length >= 55
          ? '#9A6700'
          : '#94A3B8',
    }}
  >
    {alertText.length}/60
  </div>
</div>

      <div
        style={{
          display: 'flex',

          gap: 10,

          marginTop: 12,
        }}
      >

        <button
          onClick={() => {

            setAlertText('')

            setShowAlertComposer(
              false
            )
          }}

          style={{
            flex: 1,

            height: 54,

            borderRadius: 999,

            border:
              '1px solid rgba(15,23,42,0.08)',

            background:
              'rgba(255,255,255,0.7)',

            fontSize: 15,

            fontWeight: 700,

            color: '#475569',

            cursor: 'pointer',
          }}
        >
          Cancel
        </button>

        <button
          onClick={
            handleCreateAlert
          }

          disabled={
            sendingAlert ||
            !alertText.trim()
          }

          style={{
            flex: 1,

            height: 54,

            borderRadius: 999,

            border: 'none',

            background:
              '#F4C542',

            fontSize: 15,

            fontWeight: 800,

            color: '#111827',

            cursor:
              sendingAlert ||
              !alertText.trim()
                ? 'default'
                : 'pointer',

            opacity:
              sendingAlert ||
              !alertText.trim()
                ? 0.55
                : 1,
          }}
        >
          {sendingAlert
            ? 'Sending...'
            : 'Send Alert'}
        </button>

      </div>

    </div>

  </div>
)}

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

<textarea
  value={postText}
  onChange={(e) => {
    setPostText(e.target.value)

    e.currentTarget.style.height = 'auto'
    e.currentTarget.style.height =
      `${e.currentTarget.scrollHeight}px`
  }}
  placeholder="Write something..."
  rows={1}
  autoComplete="off"
  autoCorrect="on"
  autoCapitalize="sentences"
  spellCheck={true}
  enterKeyHint="send"
  style={{
    flex: 1,

    border: 'none',
    outline: 'none',

    background: 'transparent',

    fontSize: 16,
    lineHeight: 2.8,

    color: '#111827',

    resize: 'none',
    overflow: 'hidden',

    minHeight: 24,
    maxHeight: 180,

    fontFamily: 'inherit',

    boxSizing: 'border-box',
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

<textarea
  value={replyText}
  onChange={(e) => {
    setReplyText(e.target.value)

    e.currentTarget.style.height = 'auto'
    e.currentTarget.style.height =
      `${Math.min(
        e.currentTarget.scrollHeight,
        160
      )}px`
  }}
  placeholder="Reply..."
  rows={1}
  autoComplete="off"
  autoCorrect="on"
  autoCapitalize="sentences"
  spellCheck={true}
  enterKeyHint="send"
  style={{
    flex: 1,

    border: 'none',
    outline: 'none',

    background: 'transparent',

    fontSize: 16,
    lineHeight: 2.8,

    color: '#111827',

    minHeight: 48,
    maxHeight: 160,

    resize: 'none',
    overflowY: 'auto',
    overflowX: 'hidden',

    fontFamily: 'inherit',

    WebkitAppearance: 'none',

    boxSizing: 'border-box',
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