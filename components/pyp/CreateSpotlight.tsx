'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNotify } from '@/components/NotificationProvider'
import { useRouter } from 'next/navigation'
import { Sparkles, ChevronDown } from 'lucide-react'

export default function CreateSpotlight() {
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [link, setLink] = useState('')
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState('creator')
  const [loading, setLoading] = useState(false)
  const { notify } = useNotify()

  const startPYP = async () => {
    if (loading) return

    // 1️⃣ Fetch balance (final gate only)
    const { data: balanceData } = await supabase
      .from('egg_puff_ledger')
      .select('amount')
      .eq('user_id', userId)

    const balance =
  balanceData?.reduce(
    (sum: number, item: { amount: number }) =>
      sum + item.amount,
    0
  ) ?? 0    

   if (balance < 14) {
  notify('You need 14 🥐 to launch a Campus Spotlight')
  return
}

    if (!link.trim()) {
  notify('Please enter a destination link.')
  return
}

try {
  new URL(link)
} catch {
  notify('Please enter a valid URL.')
  return
}

    

    try {
      const expiresAt = new Date()
      // TODO:
// Replace time-based expiry with
// discovery-based completion.

      const { data: activeSpotlight } = await supabase
  .from('pyp_promotions')
  .select('id')
  .eq('user_id', userId)
  .eq('status', 'active')
  .maybeSingle()

if (activeSpotlight) {
  notify('You already have an active Campus Spotlight.')
  return
}

setLoading(true)
      // create PYP
      const { error: pypError } = await supabase
        .from('pyp_promotions')
        .insert({
  user_id: userId,
  category,
  link,
  caption,
  status: 'active',
  started_at: new Date().toISOString(),
  expires_at: expiresAt.toISOString(),
  impressions_limit: 500,
  impressions_used: 0,
  discoveries_delivered: 0,
  click_count: 0,
  profile_visits: 0,
})

      if (pypError) throw pypError

      // deduct 14 🥐
      const { error: ledgerError } = await supabase
        .from('egg_puff_ledger')
        .insert({
          user_id: userId,
          amount: -14,
          reason: 'pyp_start',
        })

      if (ledgerError) throw ledgerError

      notify('✨ Campus Spotlight launched!')
router.push('/pyp')
    } catch (err: any) {
    console.error('PYP START ERROR:', JSON.stringify(err, null, 2))
    notify('Unable to launch your Campus Spotlight.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUserId(user?.id ?? null)
  }

  loadUser()
}, [])

return (
  <main
    style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: '24px 18px 120px',
    }}
  >
    <div
  style={{
    borderRadius: 24,
    padding: 26,
    marginBottom: 24,
    background:
      'linear-gradient(135deg,#FFF7E8 0%,#FFFDF8 100%)',
    border: '1px solid #F5E7C5',
  }}
>
<div
  style={{
    width: 52,
    height: 52,
    borderRadius: 18,
    background: '#F4B860',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  }}
>
  <Sparkles size={24} color="#111827" />
</div>

  <p
    style={{
      color: '#6B7280',
      marginTop: 10,
fontSize: 15,
lineHeight: 1.75,
maxWidth: 340,
      marginBottom: 0,
    }}
  >
    Introduce yourself, your project, portfolio or club to
    students from your campus. Campus Spotlights are built
    for discovery—not advertisements.
  </p>
</div>

<div
  style={{
    background: '#fff',
    borderRadius: 24,
    padding: 24,
    border: '1px solid #ECECEC',
    boxShadow: '0 8px 30px rgba(0,0,0,.04)',
  }}
>


    <div style={{ marginBottom: 14 }}>
  <label
    style={{
      display: 'block',
      marginBottom: 8,
      fontSize: 14,
      fontWeight: 600,
      color: '#374151',
    }}
  >
    Category
  </label>

<div
  style={{
    position: 'relative',
  }}
>
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    style={{
      width: '100%',
      height: 58,
      padding: '0 52px 0 18px',
      borderRadius: 18,
      border: '1px solid #E5E7EB',
      background: '#fff',
      fontSize: 15,
      fontWeight: 500,
      appearance: 'none',
      WebkitAppearance: 'none',
      outline: 'none',
      cursor: 'pointer',
    }}
  >
<option value="creator">Creator</option>
<option value="portfolio">Portfolio</option>
<option value="startup">Startup</option>
<option value="project">Project</option>
<option value="club">Club</option>
<option value="event">Event</option>
<option value="website">Personal Website</option>
<option value="other">Other</option>
  </select>
  <div
  style={{
    position: 'absolute',
    right: 18,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: '#6B7280',
  }}
>
  <ChevronDown size={18} />
</div>
</div>
</div>

    <input
  type="url"
  name="pyp-link"
  placeholder="Profile / Website Link"
  value={link}
  onChange={(e) =>
    setLink(e.target.value)
  }
  autoComplete="url"
  autoCorrect="off"
  autoCapitalize="none"
  spellCheck={false}
  enterKeyHint="next"
  style={{
    width: '100%',

height: 58,
padding: '0 18px',
fontSize: 15,
fontWeight: 500,

    borderRadius: 18,

    border: '1px solid #E5E7EB',

    outline: 'none',

    marginBottom: 10,

    background: '#FFFFFF',

    boxSizing: 'border-box',

    transition:
      'border-color .18s ease, box-shadow .18s ease',
  }}
/>

    <input
  type="text"
  name="pyp-caption"
  placeholder="Description"
  value={caption}
  onChange={(e) =>
    setCaption(e.target.value)
  }
  autoComplete="off"
  autoCorrect="on"
  autoCapitalize="sentences"
  spellCheck={true}
  enterKeyHint="done"
  style={{
    width: '100%',

height: 58,
padding: '0 18px',
fontSize: 15,
fontWeight: 500,

    borderRadius: 18,

    border: '1px solid #E5E7EB',

    outline: 'none',

    marginBottom: 18,

    background: '#FFFFFF',

    boxSizing: 'border-box',

    transition:
      'border-color .18s ease, box-shadow .18s ease',
  }}
/>

    <div
      style={{
        textAlign: 'center',

        marginBottom: 20,

        lineHeight: 1.7,
      }}
    >
      <div
  style={{
    background: '#FFF8EB',
    border: '1px solid #F5E7C5',
    borderRadius: 18,
    padding: 18,
    marginBottom: 22,
    textAlign: 'left',
  }}
>
  <>
  <div
    style={{
      fontWeight: 700,
      fontSize: 17,
      color: '#111827',
      marginBottom: 6,
    }}
  >
    Your Campus Spotlight
  </div>

  <div
    style={{
      color: '#6B7280',
      fontSize: 13,
      lineHeight: 1.6,
      marginBottom: 18,
    }}
  >
    Only students from your campus will discover this Spotlight.
  </div>
</>

<div
  style={{
    display: 'grid',
    gap: 14,
  }}
>
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <span
      style={{
        color: '#6B7280',
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      Cost
    </span>

    <strong
      style={{
        fontSize: 17,
        color: '#111827',
      }}
    >
      14 🥐
    </strong>
  </div>

  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <span
      style={{
        color: '#6B7280',
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      Guaranteed Discoveries
    </span>

    <strong
      style={{
        fontSize: 17,
        color: '#111827',
      }}
    >
      ≈ 500
    </strong>
  </div>

  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <span
      style={{
        color: '#6B7280',
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      Audience
    </span>

    <strong
      style={{
        fontSize: 17,
        color: '#111827',
      }}
    >
      Your Campus
    </strong>
  </div>
</div>
    </div>

    <button
      onClick={startPYP}
      disabled={loading}
      onMouseDown={(e) => {
        if (!loading) {
          e.currentTarget.style.transform =
            'scale(0.94)'
        }
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform =
          'scale(1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          'scale(1)'
      }}
      onTouchStart={(e) => {
        if (!loading) {
          e.currentTarget.style.transform =
            'scale(0.94)'
        }
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform =
          'scale(1)'
      }}
      style={{
        width: '100%',

        padding: '18px 18px',

        borderRadius: 22,

        border: 'none',

        background: loading
          ? '#FDE7BF'
          : '#F4B860',

        color: '#121212',

        fontSize: 17,
        height: 58,

        fontWeight: 800,

        letterSpacing: '-0.3px',

        cursor: loading
          ? 'not-allowed'
          : 'pointer',

        opacity: loading ? 0.75 : 1,

        boxShadow:
          '0 10px 26px rgba(244,184,96,0.22)',

        transition:
          'transform 0.16s cubic-bezier(.34,1.56,.64,1)',

        WebkitTapHighlightColor:
          'transparent',
      }}
    >
      {loading
        ? 'Launching...'
        : 'Launch Campus Spotlight'}
    </button>
    </div>
    </div>
  </main>
)}