'use client'

import {
  useEffect,
  useState,
} from 'react'

import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

type Eligibility = {
  eligible: boolean
  followers_count: number
  posts_count: number
  profile_complete: boolean
  active_recently: boolean
}

type Community = {
  id: string
  name: string
  slug: string
  description: string | null
  members_count: number
  avatar_url?: string | null
  banner_url?: string | null
}

export default function CommunitiesPage() {

  const router = useRouter()

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────

  const [loading, setLoading] =
    useState(true)

  const [tab, setTab] =
    useState<'joined' | 'create'>(
      'joined'
    )

  const [eligibility, setEligibility] =
    useState<Eligibility | null>(null)

  const [joinedCommunities,
    setJoinedCommunities] =
      useState<Community[]>([])

const [
  exploreCommunities,
  setExploreCommunities
] = useState<Community[]>([])

  const [showCreateModal,
    setShowCreateModal] =
      useState(false)

  const [creating, setCreating] =
    useState(false)

  const [name, setName] =
    useState('')

  const [description,
    setDescription] =
      useState('')
      
  const [showCreateFlow,
  setShowCreateFlow] =
    useState(false)
      

  // ─────────────────────────────────────────────
  // SLUG
  // ─────────────────────────────────────────────

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')

  // ─────────────────────────────────────────────
  // LOAD
  // ─────────────────────────────────────────────

  useEffect(() => {

    const load = async () => {

      setLoading(true)

      const {
        data: { session }
      } =
        await supabase.auth.getSession()

      const userId =
        session?.user?.id

      if (!userId) {
        router.push('/login')
        return
      }

      // ─────────────────────────────
      // ELIGIBILITY
      // ─────────────────────────────

      const eligibilityRes =
        await supabase.rpc(
          'can_create_community',
          {
            p_user_id: userId,
          }
        )

      if (
        eligibilityRes.data?.[0]
      ) {
        setEligibility(
          eligibilityRes.data[0]
        )
      }

      // ─────────────────────────────
      // JOINED COMMUNITIES
      // ─────────────────────────────

      const { data } =
        await supabase
          .from('community_members')
          .select(`
  communities (
    id,
    name,
    slug,
    description,
    members_count,
    avatar_url,
    banner_url
  )
`)
          .eq('user_id', userId)

      const formatted =
  (data || [])

    .map((item: any) => {

      const community =
        item.communities

      if (!community)
        return null

      const avatarUrl =
        community.avatar_url

          ? supabase.storage

              .from(
                'community-avatars'
              )

              .getPublicUrl(
                community.avatar_url
              )

              .data.publicUrl

          : null

      const bannerUrl =
        community.banner_url

          ? supabase.storage

              .from(
                'community-banners'
              )

              .getPublicUrl(
                community.banner_url
              )

              .data.publicUrl

          : null

      return {

        ...community,

        avatar_url:
          avatarUrl,

        banner_url:
          bannerUrl,
      }

    })

    .filter(Boolean)

      setJoinedCommunities(
        formatted
      )

      // ─────────────────────────────
// EXPLORE COMMUNITIES
// ─────────────────────────────

const joinedIds =
  formatted.map(
    (c: any) => c.id
  )

const {
  data: exploreData
} = await supabase

  .from('communities')

  .select(`
    id,
    name,
    slug,
    description,
    members_count,
    avatar_url
  `)

  .not(
    'id',
    'in',
    `(${joinedIds.length
      ? joinedIds.join(',')
      : '00000000-0000-0000-0000-000000000000'
    })`
  )

  .order(
    'members_count',
    {
      ascending: false,
    }
  )

  .limit(8)

const exploreFormatted =
  (exploreData || [])

    .map((community: any) => {

      const avatarUrl =
        community.avatar_url

          ? supabase.storage

              .from(
                'community-avatars'
              )

              .getPublicUrl(
                community.avatar_url
              )

              .data.publicUrl

          : null

      const bannerUrl =
        community.banner_url

          ? supabase.storage

              .from(
                'community-banners'
              )

              .getPublicUrl(
                community.banner_url
              )

              .data.publicUrl

          : null

      return {

        ...community,

        avatar_url:
          avatarUrl,

        banner_url:
          bannerUrl,
      }

    })

setExploreCommunities(
  exploreFormatted
)

      setLoading(false)
    }

    load()

  }, [router])

  // ─────────────────────────────────────────────
  // CREATE COMMUNITY
  // ─────────────────────────────────────────────

  const handleCreate =
    async () => {

      if (
        !eligibility?.eligible
      ) return

      if (!name.trim()) return

      try {

        setCreating(true)

        const {
          data: { session }
        } =
          await supabase.auth.getSession()

        const userId =
          session?.user?.id

        if (!userId) return

        // 🔥 CREATE COMMUNITY

        const { data, error } =
  await supabase
    .from('communities')
    .insert({

      owner_id:
        userId,

      name:
        name.trim(),

      slug,

      description:
        description.trim(),
    })
    .select()
    .single()

        if (error || !data) {
          console.error(
  'COMMUNITY CREATE ERROR:',
  error
)

alert(
  error?.message ||
  'Failed to create community'
)
          return
        }

        // 🔥 AUTO JOIN

        const memberInsert =
  await supabase
    .from('community_members')
    .insert({
      community_id:
        data.id,

      user_id:
        userId,
    })


await supabase
  .from('communities')
  .update({
    members_count: 1,
  })
  .eq('id', data.id)

        // 🔥 UPDATE UI

        setJoinedCommunities(
          (prev) => [
            data,
            ...prev,
          ]
        )

        // 🔥 CLOSE MODAL

        setShowCreateModal(false)

        setName('')
        setDescription('')

        // 🔥 REDIRECT

        router.push(
          `/communities/${data.slug}`
        )

      } catch (e: any) {

  console.error(
    'FULL COMMUNITY ERROR:',
    JSON.stringify(
      e,
      null,
      2
    )
  )

} finally {

        setCreating(false)
      }
    }

  // ─────────────────────────────
// LOADING
// ─────────────────────────────

if (loading) {

  return (

    <div
      style={{
        height: '100vh',

        background: '#FFFFFF',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        flexDirection: 'column',

        paddingLeft: 24,
        paddingRight: 24,
      }}
    >

      {/* SPIN */}

      <style jsx>{`

        @keyframes eggpuffSpin {

          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

      `}</style>

      {/* TITLE */}

      <div
        style={{
          display: 'flex',

          alignItems: 'center',

          gap: 10,
        }}
      >

        <div
          style={{
            fontSize: 30,

            fontWeight: 800,

            color: '#0F172A',

            letterSpacing: '-1px',

            lineHeight: '36px',
          }}
        >
          Communities
        </div>

        {/* BETA */}

        <div
          style={{
            paddingLeft: 10,
            paddingRight: 10,

            height: 30,

            borderRadius: 999,

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            background:
              'rgba(244,184,96,0.10)',

            border:
              '1px solid rgba(244,184,96,0.26)',

            fontSize: 13,

            fontWeight: 700,

            color: '#D97706',

            letterSpacing: '0.4px',
          }}
        >
          BETA
        </div>

      </div>

      {/* SUBTEXT */}

      <div
        style={{
          marginTop: 10,

          fontSize: 15,

          color: '#64748B',

          textAlign: 'center',

          lineHeight: '24px',

          fontWeight: 500,
        }}
      >
        Loading communities...
      </div>

      {/* LOADER */}

      <div
        style={{
          marginTop: 24,

          width: 34,
          height: 34,

          borderRadius: 999,

          border:
            '3px solid rgba(15,23,42,0.08)',

          borderTop:
            '3px solid #0F172A',

          animation:
            'eggpuffSpin 0.8s linear infinite',
        }}
      />

    </div>

  )
}
  // ─────────────────────────────────────────────
  // REQUIREMENTS
  // ─────────────────────────────────────────────

  const requirements = [

  {
    label: 'Complete profile',

    passed:
      !!eligibility?.profile_complete,
  },

  {
    label: '15 loyal followers',

    passed:
      (eligibility?.followers_count ?? 0) >= 15,
  },

  {
    label:
      'Post 25 questions in the last 3 weeks',

    passed:
      (eligibility?.posts_count ?? 0) >= 25,
  },

  {
    label:
      'Active within 72 hours',

    passed:
      !!eligibility?.active_recently,
  },
]

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (

    <div
      style={{
        padding:
      '1px 20px 24px',
        maxWidth: 620,
        margin: '0 auto',

        fontFamily:
          'Inter, system-ui, sans-serif',
      }}
    >

      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >

        <div
          style={{
            fontSize: 32,

            fontWeight: 700,

            letterSpacing:
              '-1.5px',

            color: '#111827',
          }}
        >
          Communities
        </div>

        <div
          style={{
            padding:
              '6px 10px',

            borderRadius: 999,

            background:
              'rgba(244,197,66,0.15)',

            border:
              '1px solid rgba(244,197,66,0.35)',

            fontSize: 12,

            fontWeight: 700,

            color: '#B7791F',
          }}
        >
          BETA
        </div>

      </div>

      {/* SUBTEXT */}
      <div
        style={{
          marginTop: 6,

          color: '#667085',

          fontSize: 16,

          lineHeight: '28px',

          fontWeight: 500,
        }}
      >
        Join like-minded people
        inside EggPuff.
      </div>

      {/* TABS */}
      <div
        style={{
          display: 'flex',

          gap: 10,

          marginTop: 28,
        }}
      >

        {['joined', 'create']
          .map((item) => (

          <button
            key={item}

            onClick={() =>
              setTab(
                item as
                'joined'
                | 'create'
              )
            }

            style={{
              height: 44,

              padding:
                '0 18px',

              borderRadius: 999,

              border:
                tab === item
                  ? 'none'
                  : '1px solid #E5E7EB',

              background:
                tab === item
                  ? '#111827'
                  : '#FFFFFF',

              color:
                tab === item
                  ? '#FFFFFF'
                  : '#111827',

              fontSize: 14,

              fontWeight: 700,

              cursor: 'pointer',
            }}
          >
            {item === 'joined'
              ? 'Joined'
              : 'Create'}
          </button>

        ))}

      </div>

    {tab !== 'create' && (

  <>

    {joinedCommunities.map(
  (community) => (

    <div

      key={community.id}

      onClick={() =>
        router.push(
          `/communities/${community.slug}`
        )
      }

      style={{
        marginTop: 18,

        borderRadius: 34,

        overflow: 'hidden',

        background: '#FFFFFF',

        border:
          '1px solid #E5E7EB',

        cursor: 'pointer',
      }}
    >

      {/* BANNER */}

      <div
        style={{
          width: '100%',
          height: 112,

          background:
            community.banner_url
              ? `url(${community.banner_url}) center/cover`
              : 'linear-gradient(135deg,#0F172A,#1E293B)',
        }}
      />

      {/* CONTENT */}

      <div
        style={{
          padding: '0 22px 22px',
        }}
      >

        {/* AVATAR */}

        <div
          style={{
            width: 64,
            height: 64,

            marginTop: -18,

            borderRadius: 999,

            overflow: 'hidden',

            background: '#FFFFFF',

            padding: 3,

            boxShadow:
              '0 4px 14px rgba(0,0,0,0.08)',
          }}
        >

<img
  src={
    community.avatar_url ||
    '/default-avatar.png'
  }

  alt={community.name}

  loading="lazy"

  decoding="async"

  draggable={false}

  style={{
    width: '100%',
    height: '100%',

    objectFit: 'cover',

    borderRadius: 999,

    display: 'block',

    userSelect: 'none',

    background: '#F1F5F9',

    pointerEvents: 'none',
  }}
/>

        </div>

        {/* NAME */}

        <div
          style={{
            marginTop: 18,

            fontSize: 20,

            fontWeight: 800,

            color: '#0F172A',
          }}
        >
          {community.name}
        </div>

        {/* MEMBERS */}

        <div
          style={{
            marginTop: 8,

            color: '#64748B',

            fontSize: 15,

            fontWeight: 500,
          }}
        >
          {community.members_count || 0}
          {' '}
          members
        </div>

        {/* DESCRIPTION */}

        {community.description && (

          <div
            style={{
              marginTop: 14,

              color: '#475569',

              fontSize: 15,

              lineHeight: '26px',

              display: '-webkit-box',

              WebkitLineClamp: 2,

              WebkitBoxOrient:
                'vertical',

              overflow: 'hidden',
            }}
          >
            {community.description}
          </div>

        )}

      </div>

    </div>

  )
)}

      {/* EXPLORE */}

<div
  style={{
    marginTop: 38,
  }}
>

  {/* HEADER */}

  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}
  >

    <div
      style={{
        fontSize: 24,
        fontWeight: 800,
        color: '#0F172A',
      }}
    >
      Explore Communities
    </div>

  </div>

  {/* SUBTEXT */}

  <div
    style={{
      marginTop: 8,

      color: '#64748B',

      fontSize: 15,

      lineHeight: '24px',
    }}
  >
    Discover communities
    across EggPuff.
  </div>

  {/* LIST */}

  <div
    style={{
      marginTop: 20,

      display: 'flex',
      flexDirection: 'column',

      gap: 16,
    }}
  >

    {exploreCommunities.map(
      (community) => (

        <div
          key={community.id}

          onClick={() =>
            router.push(
              `/communities/${community.slug}`
            )
          }

          style={{
            border:
              '1px solid #E5E7EB',

            borderRadius: 26,

            overflow: 'hidden',

            background: '#FFFFFF',

            cursor: 'pointer',
          }}
        >

          {/* BANNER */}

          <div
            style={{
              width: '100%',
              height: 88,

              background:
                community.banner_url

                  ? `url(${community.banner_url}) center/cover`

                  : 'linear-gradient(135deg,#0F172A,#1E293B)',
            }}
          />

          {/* CONTENT */}

          <div
            style={{
              padding: 18,

              marginTop: -28,
            }}
          >

            {/* AVATAR */}

            <div
              style={{
                width: 58,
                height: 58,

                borderRadius: 999,

                background: '#FFFFFF',

                padding: 3,
              }}
            >

              <img
  src={
    community.avatar_url ||
    '/default-avatar.png'
  }

  loading="lazy"

  decoding="async"

  draggable={false}

  alt={community.name}

  style={{
    width: '100%',
    height: '100%',

    borderRadius: 999,

    objectFit: 'cover',

    display: 'block',

    userSelect: 'none',

  }}
/>

            </div>

            {/* NAME */}

            <div
              style={{
                marginTop: 12,

                fontSize: 19,

                fontWeight: 800,

                color: '#0F172A',
              }}
            >
              {community.name}
            </div>

            {/* MEMBERS */}

            <div
              style={{
                marginTop: 6,

                color: '#64748B',

                fontSize: 14,

                fontWeight: 500,
              }}
            >
              {community.members_count || 0}
              {' '}
              members
            </div>

            {/* DESCRIPTION */}

            {community.description && (

              <div
                style={{
                  marginTop: 12,

                  color: '#475569',

                  fontSize: 15,

                  lineHeight: '25px',
                }}
              >
                {community.description}
              </div>

            )}

          </div>

        </div>

      )
    )}

  </div>

</div>
  </>

)}

      {/* CREATE TAB */}
      {tab === 'create' && (

        <div
          style={{
            marginTop: 28,
          }}
        >

          {/* REQUIREMENTS CARD */}
          <div
            style={{
              border:
                '1px solid #ECEEF2',

              borderRadius: 28,

              overflow: 'hidden',

              background:
                '#FFFFFF',
            }}
          >

            {requirements.map(
              (item, index) => (

              <div
                key={item.label}

                style={{
                  display: 'flex',

                  alignItems: 'center',

                  justifyContent:
                    'space-between',

                  padding:
                    '22px 22px',

                  borderBottom:
                    index !==
                    requirements.length - 1
                      ? '1px solid #F3F4F6'
                      : 'none',
                }}
              >

                <div
                  style={{
                    fontSize: 16,

                    fontWeight: 650,

                    color: '#111827',
                  }}
                >
                  {item.label}
                </div>

                {item.passed ? (

                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect
                      width="24"
                      height="24"
                      rx="7"
                      fill="#4ADE80"
                    />

                    <path
                      d="M7 12.5L10.2 15.5L17 8.5"
                      stroke="white"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                ) : (

                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect
                      width="24"
                      height="24"
                      rx="7"
                      fill="#F43F5E"
                    />

                    <path
                      d="M8 8L16 16"
                      stroke="white"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />

                    <path
                      d="M16 8L8 16"
                      stroke="white"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </svg>

                )}

              </div>

            ))}

          </div>

          {/* BUTTON */}
          <button

            onClick={() =>
              setShowCreateModal(
                true
              )
            }

            disabled={
              !eligibility?.eligible
            }

            style={{
              marginTop: 28,

              width: '100%',

              height: 58,

              borderRadius: 999,

              border: 'none',

              background:
                eligibility?.eligible
                  ? '#F4C542'
                  : '#E5E7EB',

              color:
                eligibility?.eligible
                  ? '#111827'
                  : '#98A2B3',

              fontSize: 16,

              fontWeight: 750,

              cursor:
                eligibility?.eligible
                  ? 'pointer'
                  : 'not-allowed',
            }}
          >
            Create Community
          </button>

        </div>

      )}

      {/* CREATE MODAL */}
      {showCreateModal && (

        <div
          onClick={() =>
            setShowCreateModal(
              false
            )
          }

          style={{
            position: 'fixed',

            inset: 0,

            background:
              'rgba(0,0,0,0.45)',

            zIndex: 999,
          }}
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }

            style={{
              position: 'absolute',

              left: '50%',

              top: '50%',

              transform:
                'translate(-50%, -50%)',

              width: '92%',

              maxWidth: 520,

              background:
                '#FFFFFF',

              borderRadius: 30,

              padding: 24,
            }}
          >

            {/* TITLE */}
            <div
              style={{
                fontSize: 28,

                fontWeight: 800,

                letterSpacing:
                  '-1px',
              }}
            >
              Create Community
            </div>

            {/* INPUT */}
<input
  type="text"
  name="community-name"
  placeholder="Community name"
  value={name}
  onChange={(e) =>
    setName(e.target.value)
  }
  maxLength={32}
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="words"
  spellCheck={false}
  enterKeyHint="done"
  data-form-type="other"
  style={{
    marginTop: 24,

    width: '100%',
    height: 56,

    borderRadius: 18,

    border: '1px solid #E5E7EB',

    padding: '0 18px',

    fontSize: 16,
    fontWeight: 600,

    color: '#111827',

    background: '#FFFFFF',

    outline: 'none',

    boxSizing: 'border-box',

    transition:
      'border-color .18s ease, box-shadow .18s ease',
  }}
/>

            {/* DESCRIPTION */}
            <textarea

              placeholder="Describe your community..."

              value={description}

              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }

              maxLength={180}

              style={{
                marginTop: 14,

                width: '100%',

                minHeight: 120,

                borderRadius: 18,

                border:
                  '1px solid #E5E7EB',

                padding:
                  '16px 18px',

                fontSize: 15,

                lineHeight:
                  '24px',

                resize: 'none',

                outline: 'none',

                boxSizing:
                  'border-box',
              }}
            />

            {/* BUTTON */}
            <button

              onClick={
                handleCreate
              }

              disabled={
                !name.trim() ||
                creating
              }

              style={{
                marginTop: 20,

                width: '100%',

                height: 58,

                borderRadius: 999,

                border: 'none',

                background:
                  '#F4C542',

                color:
                  '#111827',

                fontSize: 16,

                fontWeight: 750,

                cursor:
                  'pointer',
              }}
            >
              {creating
                ? 'Creating...'
                : 'Create Community'}
            </button>

          </div>

        </div>

      )}

    </div>
  )
}