'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { getEggPuffBalance } from '../../../lib/rewards'
import Skeleton from '@/components/Skeleton'
import { useNotify } from '../../../components/NotificationProvider'
import { extractUrl } from '@/lib/extractUrl'
import { getLinkType } from '@/lib/getLinkType'
import { highlightLinks } from '@/lib/highlightLinks'

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

  useEffect(() => {
  const loadPreview = async () => {
    const url = extractUrl(text)

    // ❌ no link
    if (!url) {
      setLinkPreview(null)
      return
    }

    try {
      setLoadingPreview(true)

      const res = await fetch(
        '/api/link-preview',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setLinkPreview(null)
        return
      }

      setLinkPreview(data)

    } catch (err) {
      console.error(err)
      setLinkPreview(null)
    } finally {
      setLoadingPreview(false)
    }
  }

  // 🔥 tiny debounce
  const timeout = setTimeout(() => {
    loadPreview()
  }, 500)

  return () => clearTimeout(timeout)

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

    // 🧠 Get user profile (college + batch)
const { data: profile } = await supabase
  .from('profiles')
  .select('college_id, batch_year')
  .eq('user_id', userId)
  .single()

  setIsProfileComplete(!!profile?.college_id && !!profile?.batch_year);

  // 🚫 Block if profile incomplete
if (!profile?.college_id || !profile?.batch_year) {
  notify('⚠️ Complete your profile to ask questions');
  router.push('/setup-profile');
  return;
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
        notify('❌ Failed to post question.')
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
} = await supabase.auth.getSession();

const user = session?.user ?? null;

    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('college_id, batch_year')
      .eq('user_id', user.id)
      .single();

    setIsProfileComplete(
      !!profile?.college_id && !!profile?.batch_year
    );
  };

  checkProfile();
}, []);

  /* ---------------- UI ---------------- */
  return (
  <div
    style={{
      width: '100%',

      maxWidth: 720,

      margin: '0 auto',

      padding: '0 16px 120px',

      boxSizing: 'border-box',
    }}
  >
      {pageLoading && (
        <div
        style={{
          padding: 20,
          maxWidth: 680,
          margin: '0 auto',
        }}
      >
          <Skeleton width="40%" height={26} />

          <div style={{ marginTop: 24 }}>
            <Skeleton height={16} width={120} />
            <div style={{ marginTop: 6 }}>
              <Skeleton height={48} radius={14} />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <Skeleton height={100} radius={14} />
          </div>

          <div style={{ marginTop: 16 }}>
            <Skeleton height={16} width={140} />
            <div style={{ marginTop: 6 }}>
              <Skeleton height={48} radius={14} />
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <Skeleton width={140} height={44} radius={999} />
          </div>
        </div>
      )}

      {!pageLoading && (
        <div style={{ maxWidth: 600, margin: '0 auto', marginTop: 24 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Ask the campus 🔥
          </h2>

          <p
            style={{
              fontSize: 13,
              color: '#6B7280',
              marginBottom: 20,
            }}
          >
            Ask clearly. Get better answers.
          </p>

          {/* CATEGORY */}
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, opacity: 0.7 }}>
              Category
            </label>

            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '12px 14px',
                borderRadius: 14,
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                fontSize: 14,
                appearance: 'none',
              }}
            >
              <option value="general">
                General (all topics)
              </option>

              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

         {/* QUESTION */}
<div
  style={{
    position: 'relative',
    marginTop: 12,
  }}
>
  {/* HIGHLIGHT LAYER */}
  <div
    aria-hidden
    dangerouslySetInnerHTML={{
      __html: highlightLinks(
        (text || ' ')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n$/g, '\n ')
      ),
    }}
    style={{
      position: 'absolute',

      inset: 0,

      padding: '20px 22px',

      borderRadius: 30,

      whiteSpace: 'pre-wrap',

      wordBreak: 'break-word',

      overflow: 'hidden',

      fontSize: 16,

      lineHeight: '27px',

      fontFamily:
        'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',

      fontWeight: 450,

      letterSpacing: '-0.25px',

      pointerEvents: 'none',

      color: '#18181B',

      zIndex: 2,

      boxSizing: 'border-box',
    }}
  />

  {/* PLACEHOLDER */}
  {!text && (
    <div
      style={{
        position: 'absolute',

        top: 18,

        left: 22,

        fontSize: 16,

        lineHeight: '28px',

        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',

        fontWeight: 450,

        letterSpacing: '-0.25px',

        color: '#9CA3AF',

        pointerEvents: 'none',

        zIndex: 3,
      }}
    >
      Type your thoughts here...
    </div>
  )}

  {/* REAL TEXTAREA */}
  <textarea
    value={text}
    onChange={(e) =>
      setText(e.target.value)
    }
    onFocus={() =>
      setFocused(true)
    }
    onBlur={() =>
      setFocused(false)
    }
    spellCheck={false}
    style={{
      position: 'relative',

      width: '100%',

      minHeight: 130,

      padding: '18px 22px 20px 22px',

      borderRadius: 30,

      border: focused
  ? '1.5px solid #18181B'
  : '1px solid #DADDE3',

      background: 'transparent',

      fontSize: 16,

      lineHeight: '27px',

      fontFamily:
        'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',

      fontWeight: 100,

      letterSpacing: '-0.15px',

      resize: 'none',

      outline: 'none',

      // 🔥 invisible textarea text
      color: 'transparent',

      caretColor: '#18181B',

      zIndex: 4,

      WebkitTapHighlightColor:
        'transparent',

      overflow: 'hidden',

      boxSizing: 'border-box',

      transition:
  'border-color 180ms cubic-bezier(0.4,0,0.2,1), box-shadow 220ms cubic-bezier(0.4,0,0.2,1), background-color 180ms ease',

      boxShadow: focused
  ? '0 0 0 4px rgba(24,24,27,0.035)'
  : '0 1px 2px rgba(0,0,0,0.02)',
    }}
  />
</div>

 <div
  style={{
    marginTop: 4,
    display: 'flex',
    gap: 10,
  }}
>
  

  {/* BUBBLE */}
  <div
    style={{
      flex: 1,

      display: 'flex',

      alignItems: 'center',

      justifyContent:
        'space-between',

      padding: '10px 14px',

      borderRadius: 18,

      border: '1px solid #E5E7EB',

      background: '#FFFFFF',

      boxShadow:
        '0 1px 2px rgba(0,0,0,0.03)',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 18,
        }}
      >
        🫧
      </span>

      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        Bubble
      </span>
    </div>

    <div
      onClick={() =>
        setType(
          type === 'bubble'
            ? 'normal'
            : 'bubble'
        )
      }
      style={{
        width: 40,
        height: 22,

        borderRadius: 999,

        background:
          type === 'bubble'
            ? '#F4B860'
            : '#E5E7EB',

        position: 'relative',

        cursor: 'pointer',

        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,

          borderRadius: '50%',

          background: '#FFFFFF',

          position: 'absolute',

          top: 2,

          left:
            type === 'bubble'
              ? 20
              : 2,

          transition:
            'all .2s ease',

          boxShadow:
            '0 2px 6px rgba(0,0,0,.12)',
        }}
      />
    </div>
  </div>

  {/* PDF RESOURCE */}
<button
  type="button"
  onClick={() =>
    window.location.href =
  '/upload-resource'
  }
  style={{
    width: 56,

    height: 56,

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: 18,

    border: '1px solid #E5E7EB',

    background: '#FFFFFF',

    cursor: 'pointer',

    boxShadow:
      '0 1px 2px rgba(0,0,0,0.03)',

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
    d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78l8.49-8.49a3.5 3.5 0 114.95 4.95l-8.49 8.49a1.5 1.5 0 11-2.12-2.12l7.78-7.78"
    stroke="#64748B"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>
</button>
</div>

          {/* ACTIONS */}
          <div
            style={{
              marginTop: 20,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <button
  onClick={() => {
    if (!isProfileComplete) {
      notify('⚠️ Complete your profile to ask questions');
      router.push('/setup-profile');
      return;
    }
    submit();
  }}
  disabled={loading || !isProfileComplete}
  style={{
    padding: '12px 18px',
    borderRadius: 999,
    border: 'none',
    background: !isProfileComplete ? '#E5E7EB' : '#FCD34D',
    color: !isProfileComplete ? '#9CA3AF' : '#111827',
    fontWeight: 600,
    fontSize: 14,
    cursor:
      loading || !isProfileComplete
        ? 'not-allowed'
        : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.2s ease',
  }}
>
  {!isProfileComplete
    ? 'Complete profile to ask'
    : loading
    ? 'Posting…'
    : 'Ask'}
</button>

            <button
  onClick={() => router.back()}
  style={{
    padding: '12px 16px',

    borderRadius: 999,

    background: '#F3F4F6',

    border: 'none',

    fontSize: 14,

    cursor: 'pointer',
  }}
>
  ← Back
</button>
          </div>
          <div style={{ marginTop: 24 }}>

  {/* 🔥 DIVIDER */}
  <div
    style={{
      height: 1,
      background: 'linear-gradient(to right, transparent, #E5E7EB, transparent)',
      marginBottom: 12,
      opacity: 0.6,
    }}
  />

  {/* 🔥 FEEDBACK TEXT */}
  <div
    style={{
      fontSize: 12,
      color: '#6B7280',
      textAlign: 'center',
    }}
  >
    Help us improve ✨{' '}
    <span
      onClick={() => router.push('/feedback')}
      style={{
        fontWeight: 600,
        color: '#111827',
        cursor: 'pointer',
      }}
    >
      Feedback
    </span>
  </div>

</div>
        </div>
      )}
    </div>
  )
}
