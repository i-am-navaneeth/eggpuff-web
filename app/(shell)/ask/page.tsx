'use client'

import {
  useEffect,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { getEggPuffBalance } from '../../../lib/rewards'
import Skeleton from '@/components/Skeleton'
import { useNotify } from '../../../components/NotificationProvider'
import { extractUrl } from '@/lib/extractUrl'
import { getLinkType } from '@/lib/getLinkType'
import { highlightLinks } from '@/lib/highlightLinks'
import ComposerEditor from '@/components/editor/ComposerEditor'

type Category = {
  id: string
  label: string
}

/* 🔹 slug → readable label (fallback only) */
function slugToLabel(slug: string) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export default function AskPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { notify } = useNotify()

  const [text, setText] = useState('')
  const [hours, setHours] = useState(1)
  const [category, setCategory] = useState<string>('general')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  const [profile, setProfile] = useState<{
  name: string | null
  avatar_url: string | null
  college_id: string | null
  batch_year: number | null
} | null>(null)
const [showCategories, setShowCategories] =
  useState(false)
  const [categoryExpanded, setCategoryExpanded] =
  useState(true)
  const [previewDismissed, setPreviewDismissed] =
  useState(false)
  const [keyboardHeight, setKeyboardHeight] =
  useState(0)
  const [showDiscardDialog, setShowDiscardDialog] =
  useState(false)
  

  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [type, setType] = useState<'normal' | 'bubble'>('normal')
  const [focused, setFocused] =
  useState(false)
  const prefilledCategory =
  searchParams.get('category')

  const [linkPreview, setLinkPreview] =
  useState<any>(null)

const [loadingPreview, setLoadingPreview] =
  useState(false)
  const previewCache = useRef(
  new Map<string, any>()
)

const abortController = useRef<AbortController | null>(
  null
)

const [showBubbleInfo, setShowBubbleInfo] = useState(false)

useEffect(() => {
  const dismissed = localStorage.getItem(
    'bubble-info-dismissed'
  )

  if (!dismissed && type === 'bubble') {
    setShowBubbleInfo(true)
  }
}, [type])

  useEffect(() => {
  const url = extractUrl(text)

  if (!url) {
    abortController.current?.abort()

    setLoadingPreview(false)
    setLinkPreview(null)

    return
  }

  // Already have it
  if (previewCache.current.has(url)) {
    setLinkPreview(
      previewCache.current.get(url)
    )
    return
  }

  const timer = setTimeout(async () => {
    abortController.current?.abort()

    const controller =
      new AbortController()

    abortController.current = controller

    try {
      setLoadingPreview(true)

      const res = await fetch(
        '/api/link-preview',
        {
          method: 'POST',

          signal: controller.signal,

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            url,
          }),
        }
      )

      if (!res.ok) {
        setLinkPreview(null)
        return
      }

      const data = await res.json()

      previewCache.current.set(
        url,
        data
      )

      setLinkPreview(data)

    } catch (err: any) {

      if (err.name !== 'AbortError') {
        setLinkPreview(null)
      }

    } finally {

      if (!controller.signal.aborted) {
        setLoadingPreview(false)
      }
    }

  }, 800)

  return () => clearTimeout(timer)

}, [text])

  /* ---------------- LOAD CATEGORIES ---------------- */
  useEffect(() => {
    const load = async () => {
      setPageLoading(true)

      const { data } = await supabase
        .from('categories')
        .select('id, label')
        .order('created_at', { ascending: true })

      if (data) {
        setCategories(data)
      }

      setPageLoading(false)
    }

    load()
  }, [])

  useEffect(() => {
  if (
    prefilledCategory &&
    categories.length > 0
  ) {
    const match = categories.find(
      c =>
        c.label.toLowerCase() ===
        prefilledCategory.toLowerCase()
    )

    if (match) {
      setCategory(match.id)
    }
  }
}, [
  prefilledCategory,
  categories,
])

  /* ---------------- PRESELECT CATEGORY FROM QUERY ---------------- */
  useEffect(() => {
    if (categories.length === 0) return

    const param = searchParams.get('category')
    if (!param) return

    // 🔥 If All selected → treat as General
    if (param === 'all') {
      setCategory('general')
      return
    }

    // 🔥 If General explicitly
    if (param === 'general') {
      setCategory('general')
      return
    }

    // 🔥 Try matching by ID first
    const matchById = categories.find(c => c.id === param)
    if (matchById) {
      setCategory(matchById.id)
      return
    }

    // 🔥 Fallback: match by readable label
    const matchByLabel = categories.find(
      c => slugToLabel(param) === c.label
    )

    if (matchByLabel) {
      setCategory(matchByLabel.id)
      return
    }

    // If nothing matches → default to general
    setCategory('general')
  }, [searchParams, categories])

  /* ---------------- SUBMIT ---------------- */
  const submit = async () => {
    if (!text.trim()) return

    const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

if (!user) {
  console.error('User not found')
  return
}

const userId = user.id

    const balance = await getEggPuffBalance(user.id)

    // 🧠 Get user profile
const { data: profile } = await supabase
  .from('profiles')
  .select(
    'name, avatar_url, college_id, batch_year'
  )
  .eq('user_id', userId)
  .single()

// Save for UI
setProfile(profile)

setIsProfileComplete(
  !!profile?.college_id &&
  !!profile?.batch_year
)

// 🚫 Block if profile incomplete
if (
  !profile?.college_id ||
  !profile?.batch_year
) {
  notify(
    '⚠️ Complete your profile to ask questions'
  )

  router.push('/setup-profile')

  return
}

setLoading(true)

    try {
      let categoryId: string | null = null

      if (category !== 'general') {
        categoryId = category
      }

      let expiresAt: string | null = null

if (type === 'bubble') {
  const temp = new Date()
  temp.setHours(temp.getHours() + 24)
  expiresAt = temp.toISOString()
} else {
  expiresAt = null // 🔥 normal should NEVER expire
}

      const { error: insertError } = await supabase
  .from('questions')
  .insert({
  text,
  user_id: userId,
  category_id: categoryId,
  type: type || 'normal',
  expires_at: expiresAt || null,
  college_id: profile?.college_id,
  batch_year: profile?.batch_year,
  link_url: linkPreview?.url || null,
link_title: linkPreview?.title || null,
link_description:
  linkPreview?.description || null,
link_image: linkPreview?.image || null,
link_domain: linkPreview?.domain || null,
link_type: linkPreview?.type || null,
})

      if (insertError) {
        console.error('QUESTION INSERT ERROR:', {
  message: insertError?.message,
  details: insertError?.details,
  hint: insertError?.hint,
  code: insertError?.code,
})
        notify('❌ Failed to Ask.')
        return
      }

      notify('✅ Question posted!')
      router.back()
      
    } catch (err) {
      console.error('SUBMIT ERROR:', err)
      notify('❌ Something went wrong.')
    } finally {
      setLoading(false)
    }
    await supabase.rpc('update_streak', { u_id: user.id })
  }
  

  useEffect(() => {
  const checkProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const user = session?.user

    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select(
        'name, avatar_url, college_id, batch_year'
      )
      .eq('user_id', user.id)
      .single()

    if (!profile) return

    setProfile(profile)

    setIsProfileComplete(
      !!profile.college_id &&
      !!profile.batch_year
    )
  }

  checkProfile()
}, [])

useEffect(() => {
  if (!window.visualViewport) return

  const viewport = window.visualViewport

  const updateKeyboard = () => {
    const keyboard =
      window.innerHeight -
      viewport.height -
      viewport.offsetTop

    setKeyboardHeight(
      keyboard > 0 ? keyboard : 0
    )
  }

  viewport.addEventListener(
    'resize',
    updateKeyboard
  )

  viewport.addEventListener(
    'scroll',
    updateKeyboard
  )

  updateKeyboard()

  return () => {
    viewport.removeEventListener(
      'resize',
      updateKeyboard
    )

    viewport.removeEventListener(
      'scroll',
      updateKeyboard
    )
  }
}, [])

 /* ---------------- UI ---------------- */
return (
  <div
    style={{
  width: '100%',
  maxWidth: 720,
  margin: '0 auto',
  background: '#FFFFFF',
  minHeight: '100vh',
  overflowX: 'hidden',
}}
  >
    {pageLoading ? (
      <div
        style={{
          padding: 24,
        }}
      >
        <Skeleton width="40%" height={26} />

        <div style={{ marginTop: 24 }}>
          <Skeleton height={52} radius={14} />
        </div>

        <div style={{ marginTop: 24 }}>
          <Skeleton height={180} radius={20} />
        </div>
      </div>
    ) : (
      <>
        {/* Header */}

        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'rgba(255,255,255,.92)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            padding: '14px 18px',

            borderBottom: '1px solid #F3F4F6',
          }}
        >
          <button
           onClick={() => {
  const hasContent =
    text.trim() ||
    linkPreview ||
    loadingPreview

  if (hasContent) {
    setShowDiscardDialog(true)
  } else {
    router.back()
  }
}}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#6B7280',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>

         {/* Center Title */}

<div
  style={{
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',

    fontSize: 18,
    fontWeight: 700,
    color: '#111827',

    pointerEvents: 'none',
  }}
>
  New question
</div>

{/* Character Counter */}

{text.length >= 265 && (
  <div
    style={{
      marginLeft: 'auto',

      fontSize: 13,

      fontWeight: 600,

      color:
        text.length > 280
          ? '#EF4444'
          : '#9CA3AF',

      letterSpacing: '-0.2px',

      paddingRight: 2,

      transition: 'opacity .2s ease',
    }}
  >
    {text.length}/280
  </div>
)}
        </div>

        {/* Body */}

        <div
style={{
padding:
keyboardHeight > 0
? '20px 18px 340px'
: '20px 18px 170px',

overflow: 'hidden',
}}
        >

         {/* QUESTION */}

<div
  style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
  }}
>
  {/* Avatar */}

  <img
  src={profile?.avatar_url || '/default-avatar.png'}
  alt="Profile"
  style={{
    width: 48,
    height: 48,

    borderRadius: '50%',

    objectFit: 'cover',

    flexShrink: 0,

    background: '#F3F4F6',

    marginTop: 2,
  }}
/>

  {/* Right */}

  <div
    style={{
      flex: 1,
      minWidth: 0,
      width: 0,
      overflow: 'hidden',
    }}
  >
   <div
  style={{
    display: 'flex',

    alignItems: 'center',

    gap: 4,

    marginBottom: 12,

    width: '100%',
  }}
>
  {/* Username */}

  <span
  style={{
    flexShrink: 0,

    fontWeight: 600,

    fontSize: 15,

    color: '#111827',

    lineHeight: 1,

    display: 'flex',

    alignItems: 'center',
  }}
>
    {profile?.name || 'You'}
  </span>

  {/* Category Area */}

<div
  style={{
    display: 'flex',

    alignItems: 'center',

    gap: 2,

    flex: 1,

    minWidth: 0,
  }}
>
  {/* Fixed Chevron */}

  <button
  type="button"
  onClick={() =>
    setCategoryExpanded(prev => !prev)
  }
  style={{
  width: 16,
  height: 16,

  marginLeft: 2,

  marginRight: 2,

  padding: 0,

  border: 'none',

  background: 'transparent',

  display: 'flex',

  alignItems: 'center',

  justifyContent: 'center',

  flexShrink: 0,

  cursor: 'pointer',

  transform: 'translateY(1px)',
}}
>
  {categoryExpanded ? (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M9 6L15 12L9 18"
        stroke="#6B7280"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="#6B7280"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )}
</button>

 {/* Categories */}

{categoryExpanded ? (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Left Fade */}

    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 10,
        zIndex: 2,
        pointerEvents: 'none',
        background:
          'linear-gradient(to right,#fff,rgba(255,255,255,0))',
      }}
    />

    {/* Right Fade */}

    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 10,
        zIndex: 2,
        pointerEvents: 'none',
        background:
          'linear-gradient(to left,#fff,rgba(255,255,255,0))',
      }}
    />

    <div
      style={{
        display: 'flex',
        alignItems: 'center',

        gap: 4,

        overflowX: 'auto',
        overflowY: 'hidden',

        whiteSpace: 'nowrap',

        WebkitOverflowScrolling: 'touch',

        scrollbarWidth: 'none',
        msOverflowStyle: 'none',

        padding: '0 6px',
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* General */}

      <button
        type="button"
        onClick={() => setCategory('general')}
        style={{
  flexShrink: 0,

  border: 'none',

  height: 28,

  padding: '0 10px',

  borderRadius: 999,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  background:
    category === 'general'
      ? '#EEF2F6'
      : '#F7F7F8',

  color:
    category === 'general'
      ? '#111827'
      : '#6B7280',

  fontSize: 12.5,

  fontWeight:
    category === 'general'
      ? 600
      : 500,

  cursor: 'pointer',

  whiteSpace: 'nowrap',

  transition: '.15s',
}}
      >
        🌍 General
      </button>

      {categories.map(cat => (
        <button
          key={cat.id}
          type="button"
          onClick={() => setCategory(cat.id)}
          style={{
  flexShrink: 0,

  border: 'none',

  height: 28,

  padding: '0 10px',

  borderRadius: 999,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  background:
    category === cat.id
      ? '#EEF2F6'
      : '#F7F7F8',

  color:
    category === cat.id
      ? '#111827'
      : '#6B7280',

  fontSize: 12.5,

  fontWeight:
    category === cat.id
      ? 600
      : 500,

  cursor: 'pointer',

  whiteSpace: 'nowrap',

  transition: '.15s',
}}
        >
          {cat.label}
        </button>
      ))}
    </div>
  </div>
) : (
  <button
    type="button"
    onClick={() => setCategoryExpanded(true)}
    style={{
  border: 'none',

  height: 28,

  padding: '0 10px',

  borderRadius: 999,

  display: 'flex',
  alignItems: 'center',

  background: '#EEF2F6',

  color: '#111827',

  fontSize: 12.5,

  fontWeight: 600,

  cursor: 'pointer',

  whiteSpace: 'nowrap',
}}
  >
    {category === 'general'
      ? '🌍 General'
      : categories.find(
          c => c.id === category
        )?.label}
  </button>
)}
</div>
</div>

    <div
  style={{
    position: 'relative',

    marginTop: 16,

    display: 'flex',

    flexDirection: 'column',

    width: '100%',
  }}
>

      <ComposerEditor
  value={text}
  onChange={(value) => {
  setText(value)

  setPreviewDismissed(false)
}}
/>

      {loadingPreview && !linkPreview && !previewDismissed && (
 <div
  style={{
    position: 'relative',

    marginTop: 18,

    border: '1px solid #E5E7EB',

    borderRadius: 18,

    overflow: 'hidden',

    background: '#fff',

    animation: 'previewAppear .18s ease-out',
  }}
>
  <button
  type="button"
  onClick={() => {
    setPreviewDismissed(true)
    setLinkPreview(null)
  }}
  style={{
    position: 'absolute',

    top: 10,
    right: 10,

    width: 28,
    height: 28,

    borderRadius: '50%',

    border: 'none',

    background: 'rgba(255,255,255,.94)',

    backdropFilter: 'blur(12px)',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    cursor: 'pointer',

    zIndex: 20,

    boxShadow:
      '0 2px 10px rgba(0,0,0,.08)',
  }}
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M6 6L18 18M18 6L6 18"
      stroke="#4B5563"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
</button>
    {/* Image */}

    <div
      style={{
        width: '100%',
        height: 180,

        background:
          'linear-gradient(90deg,#F3F4F6 25%,#ECEFF1 50%,#F3F4F6 75%)',

        backgroundSize: '200% 100%',
      }}
    />

    {/* Content */}

    <div
      style={{
        padding: 14,
      }}
    >
      <div
        style={{
          width: '70%',
          height: 16,

          borderRadius: 999,

          background:
            'linear-gradient(90deg,#F3F4F6 25%,#ECEFF1 50%,#F3F4F6 75%)',

          backgroundSize: '200% 100%',
        }}
      />

      <div
        style={{
          width: '100%',
          height: 12,

          marginTop: 12,

          borderRadius: 999,

          background:
            'linear-gradient(90deg,#F3F4F6 25%,#ECEFF1 50%,#F3F4F6 75%)',

          backgroundSize: '200% 100%',
        }}
      />

      <div
        style={{
          width: '85%',
          height: 12,

          marginTop: 8,

          borderRadius: 999,

          background:
            'linear-gradient(90deg,#F3F4F6 25%,#ECEFF1 50%,#F3F4F6 75%)',

          backgroundSize: '200% 100%',
        }}
      />

      <div
        style={{
          width: '35%',
          height: 11,

          marginTop: 16,

          borderRadius: 999,

          background:
            'linear-gradient(90deg,#F3F4F6 25%,#ECEFF1 50%,#F3F4F6 75%)',

          backgroundSize: '200% 100%',
        }}
      />
    </div>

    <style jsx>{`
      @keyframes previewPulse {
        0% {
          opacity: 0.7;
        }

        50% {
          opacity: 1;
        }

        100% {
          opacity: 0.7;
        }
      }

      @keyframes previewShimmer {
        0% {
          background-position: 200% 0;
        }

        100% {
          background-position: -200% 0;
        }
      }

      div div {
        animation: previewShimmer 1.5s linear infinite;
      }
    `}</style>
    <style jsx>{`
  @keyframes previewAppear {
    from {
      opacity: 0;
      transform: translateY(6px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>
  </div>
)}

      {linkPreview && (
        <div
          style={{
            marginTop: 18,

            border: '1px solid #E5E7EB',

            borderRadius: 18,

            overflow: 'hidden',

            background: '#fff',
          }}
        >
          {linkPreview.image &&
  !linkPreview.image.includes('undefined') && (
  <img
              src={linkPreview.image}
              onError={(e) => {
    e.currentTarget.style.display = 'none'
  }}
              alt=""
              style={{
                width: '100%',
                height: 180,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          )}

          <div
            style={{
              padding: 14,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 6,
              }}
            >
              {linkPreview.title}
            </div>

            <div
              style={{
                fontSize: 13,
                color: '#6B7280',
                marginBottom: 10,
              }}
            >
              {linkPreview.description}
            </div>

            <div
              style={{
                fontSize: 12,
                color: '#9CA3AF',
              }}
            >
              {linkPreview.domain}
            </div>
          </div>
        </div>
      )}
      {/* Composer Options */}

<div
  style={{
    display: 'flex',
    alignItems: 'center',

    marginTop: 10,
    marginLeft: -2,
  }}
>
  <button
    type="button"
    onClick={() => router.push('/upload-resource')}
    style={{
      width: 40,
      height: 40,

      borderRadius: 14,

      border: '1px solid #ECECEC',

      background: '#FFFFFF',

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      padding: 0,

      cursor: 'pointer',

      transition: '.15s',

      boxShadow: '0 1px 2px rgba(0,0,0,.03)',
    }}
  >
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M9.6 12.4L16.1 5.9C17.5 4.5 19.8 4.5 21.2 5.9C22.6 7.3 22.6 9.6 21.2 11L12 20.2C9.4 22.8 5.4 22.8 2.9 20.2C0.4 17.7 0.4 13.7 2.9 11.2L12.1 2"
        stroke="#98A2B3"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
</div>
    </div>
  </div>
</div>
</div>

{showBubbleInfo && (
  <div
    style={{
      position: 'fixed',

      left: 16,
      right: 16,

      bottom: keyboardHeight + 72,

      zIndex: 301,

      background: '#FFFFFF',

      border: '1px solid #ECECEC',

      borderRadius: 18,

      padding: '14px 48px 14px 16px',

      boxShadow:
        '0 8px 24px rgba(0,0,0,.08)',

      animation:
        'bubbleAppear .18s ease',
    }}
  >
    <button
      onClick={() => {
        setShowBubbleInfo(false)

        localStorage.setItem(
          'bubble-info-dismissed',
          '1'
        )
      }}
      style={{
        position: 'absolute',

        right: 14,
        top: 14,

        border: 'none',

        background: 'transparent',

        cursor: 'pointer',

        fontSize: 16,
        opacity: 65,

        color: '#9CA3AF',

        lineHeight: 1,
      }}
    >
      ✕
    </button>

    <div
      style={{
        fontSize: 13,

        lineHeight: 1.45,

        color: '#6B7280',
      }}
    >
      Bubble questions disappear after <b>24 hours</b>.
      People can still reply until they expire.
    </div>

    <style jsx>{`
      @keyframes bubbleAppear {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `}</style>
  </div>
)}

{showDiscardDialog && (
  <>
    {/* Backdrop */}

    <div
      onClick={() => setShowDiscardDialog(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.28)',
        zIndex: 398,
      }}
    />

    {/* Sheet */}

    <div
      style={{
        position: 'fixed',

        left: 16,
        right: 16,
        bottom: 18,

        background: '#FFFFFF',

        borderRadius: 22,

        padding: 18,

        boxShadow:
          '0 16px 40px rgba(0,0,0,.18)',

        zIndex: 399,

        animation:
          'discardAppear .18s ease-out',
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#111827',
        }}
      >
        Discard question?
      </div>

      <div
        style={{
          marginTop: 6,

          fontSize: 14,

          lineHeight: 1.5,

          color: '#6B7280',
        }}
      >
        Your draft will be lost if you leave this page.
      </div>

      <div
        style={{
          display: 'flex',

          gap: 12,

          marginTop: 20,
        }}
      >
        <button
          onClick={() =>
            setShowDiscardDialog(false)
          }
          style={{
            flex: 1,

            height: 46,

            borderRadius: 999,

            border: 'none',

            background: '#F3F4F6',

            color: '#374151',

            fontWeight: 600,

            cursor: 'pointer',
          }}
        >
          Keep editing
        </button>

        <button
          onClick={() => router.back()}
          style={{
            flex: 1,

            height: 46,

            borderRadius: 999,

            border: 'none',

            background: '#EF4444',

            color: '#FFFFFF',

            fontWeight: 700,

            cursor: 'pointer',
          }}
        >
          Discard
        </button>
      </div>

      <style jsx>{`
        @keyframes discardAppear {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  </>
)}

{/* Floating Bottom Bar */}

<div
  style={{
    position: 'fixed',

    left: 0,
    right: 0,
    bottom: keyboardHeight,

    zIndex: 300,

    background: 'rgba(255,255,255,.96)',

    backdropFilter: 'blur(18px)',

    WebkitBackdropFilter: 'blur(18px)',

    borderTop: '1px solid #F3F4F6',

    padding: '12px 18px',

    transition:
   'bottom .22s ease, padding .22s ease',

    paddingBottom:
   keyboardHeight > 0
    ? 12
    : 'calc(env(safe-area-inset-bottom) + 12px)',
  }}
>
  <div
    style={{
      maxWidth: 720,

      margin: '0 auto',

      display: 'flex',

      justifyContent: 'space-between',

      alignItems: 'center',
    }}
  >
    {/* Bubble Toggle */}

<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }}
>

  <button
    type="button"
    onClick={() => {
  if (type === 'bubble') {
    setType('normal')
    setShowBubbleInfo(false)
  } else {
    setType('bubble')

    if (
      !localStorage.getItem(
        'bubble-info-dismissed'
      )
    ) {
      setShowBubbleInfo(true)
    }
  }
}}
    style={{
  width: 66,
  height: 36,

  border: 'none',

  borderRadius: 999,

  cursor: 'pointer',

  position: 'relative',

  background:
    type === 'bubble'
      ? '#111827'
      : '#E5E7EB',

  transition: '.22s',
}}
  >
    <div
      style={{
  position: 'absolute',

  top: 3,

  left:
    type === 'bubble'
      ? 33
      : 3,

  width: 30,
  height: 30,

  borderRadius: '50%',

  background:
    type === 'bubble'
      ? '#FFF3DE'
      : '#FFFFFF',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  transition: '.22s',

  boxShadow:
    '0 2px 8px rgba(0,0,0,.16)',
}}
    >
      🫧
    </div>
  </button>
</div>

    {/* Ask */}

    <button
  onClick={() => {
    if (!isProfileComplete) {
      notify('⚠️ Complete your profile to ask questions')
      router.push('/setup-profile')
      return
    }

    submit()
  }}
  disabled={
    loading ||
    !text.trim() ||
    !isProfileComplete ||
    text.length > 280
  }
  style={{
  border: 'none',

  borderRadius: 999,

  minWidth: 84,

  height: 44,

  padding: '0 20px',

  background:
    loading ||
    !text.trim() ||
    !isProfileComplete ||
    text.length > 280
      ? '#E5E7EB'
      : '#F4B860',

  color:
    loading ||
    !text.trim() ||
    !isProfileComplete ||
    text.length > 280
      ? '#9CA3AF'
      : '#111827',

  fontWeight: 700,

  fontSize: 15,

  letterSpacing: '-0.2px',

  cursor:
    loading ||
    !text.trim() ||
    !isProfileComplete ||
    text.length > 280
      ? 'not-allowed'
      : 'pointer',

  transition:
    'background .18s ease, transform .12s ease',

  boxShadow:
    loading ||
    !text.trim() ||
    !isProfileComplete ||
    text.length > 280
      ? 'none'
      : '0 4px 12px rgba(244,184,96,.18)',
}}
>
  {loading ? 'Posting...' : 'Ask'}
</button>
  </div>
</div>
   </>
)}
</div>
)
}