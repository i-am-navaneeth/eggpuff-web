'use client'

import { Sparkles, Rocket, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  SpotlightAnalytics,
} from '@/components/pyp/analytics'

export default function CreatorHub() {
  const router = useRouter()
  const [spotlight, setSpotlight] = useState<any>(null)
  const [loadingSpotlight, setLoadingSpotlight] = useState(true)

  useEffect(() => {
  const loadSpotlight = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      setLoadingSpotlight(false)
      return
    }

    const { data } = await supabase
      .from('pyp_promotions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .order('started_at', {
        ascending: false,
      })
      .limit(1)
      .maybeSingle()

    setSpotlight(data)
    setLoadingSpotlight(false)
  }

  loadSpotlight()
}, [])

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '24px 18px 120px',
      }}
    >
      {/* Hero */}
      <div
        style={{
          borderRadius: 24,
          padding: 28,
          background:
            'linear-gradient(135deg,#FFF7E8 0%,#FFFDF8 100%)',
          border: '1px solid #F5E7C5',
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: '#F4B860',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
          }}
        >
          <Sparkles size={28} color="#121212" />
        </div>

        <h1
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: '#111827',
            margin: 0,
          }}
        >
          Promote Your Profile
        </h1>

        <p
  style={{
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 1.7,
  }}
>
  Promote Your Profile(PYP)/Campus Spotlights helps other students discover your
  portfolio, startup, club, project or creator profile—
  naturally inside EggPuff.
</p>

        <button
          onClick={() => router.push('/pyp/create')}
          style={{
            marginTop: 24,
            width: '100%',
            border: 'none',
            borderRadius: 18,
            padding: '16px',
            background: '#F4B860',
            color: '#111827',
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 12px 28px rgba(244,184,96,.28)',
          }}
        >
          <Rocket size={20} />
          Launch Spotlight
        </button>
      </div>

      {/* Your Spotlight */}
<section
  style={{
    marginTop: 42,
  }}
>

  {loadingSpotlight ? (
  <div
    style={{
      marginTop: 20,
      textAlign: 'center',
      color: '#6B7280',
    }}
  >
    Loading analytics...
  </div>
) : spotlight ? (
<div
  style={{
    marginTop: 20,
  }}
>
    {/* Header */}
<div
  style={{
    paddingBottom: 28,
  }}
>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CheckCircle2
            size={22}
            color="#16A34A"
          />

          <div>
            <div
              style={{
                fontWeight: 700,
                color: '#166534',
              }}
            >
              Active Spotlight
            </div>

            <div
              style={{
                fontSize: 13,
                color: '#6B7280',
                marginTop: 2,
              }}
            >
              Students are discovering you across campus.
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '6px 12px',
            borderRadius: 999,
            background: '#DCFCE7',
            color: '#166534',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          LIVE
        </div>
      </div>
    </div>

    {/* Analytics */}
    <SpotlightAnalytics
  spotlight={spotlight}
/>  
 </div>
) : (
  <div
    style={{
      marginTop: 20,
      padding: 22,
      borderRadius: 18,
      background: '#FAFAFA',
      border: '1px dashed #E5E7EB',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: 58,
        height: 58,
        margin: '0 auto 16px',
        borderRadius: '50%',
        background: '#FFF7E8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Rocket
        size={26}
        color="#D97706"
      />
    </div>

    <h3
      style={{
        margin: 0,
        fontSize: 20,
        fontWeight: 700,
      }}
    >
      No Active Spotlight
    </h3>

    <p
      style={{
        marginTop: 12,
        color: '#6B7280',
        lineHeight: 1.7,
      }}
    >
      Launch your first Campus Spotlight and introduce your
      portfolio, project, startup or club to students from
      your campus.
    </p>

    <button
      onClick={() => router.push('/pyp/create')}
      style={{
        marginTop: 22,
        padding: '14px 22px',
        borderRadius: 16,
        border: 'none',
        background: '#F4B860',
        color: '#111827',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      Launch Spotlight
    </button>
  </div>
)}
</section>

     {/* How Campus Spotlight Works */}
<section
  style={{
    marginTop: 72,
  }}
>
  <h2
    style={{
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
    }}
  >
    How It Works
  </h2>

  <div
    style={{
      marginTop: 24,
      display: 'grid',
      gap: 20,
    }}
  >
    {[
      {
        step: '01',
        title: 'Launch',
        text: 'Spend 14 EP points to launch a Campus Spotlight.',
      },
      {
        step: '02',
        title: 'Discover',
        text: 'Students from your campus discover your Spotlight naturally across EggPuff.',
      },
      {
        step: '03',
        title: 'Grow',
        text: 'Gain profile visits, followers and genuine campus recognition.',
      },
    ].map((item) => (
      <div
        key={item.step}
        style={{
          display: 'flex',
          gap: 18,
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            minWidth: 42,
            height: 42,
            borderRadius: 12,
            background: '#FFF7E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#D97706',
          }}
        >
          {item.step}
        </div>

        <div>
          <div
            style={{
              fontWeight: 700,
              marginBottom: 6,
              color: '#111827',
            }}
          >
            {item.title}
          </div>

          <div
            style={{
              color: '#6B7280',
              lineHeight: 1.7,
            }}
          >
            {item.text}
          </div>
        </div>
      </div>
    ))}
  </div>
</section>
    </main>
  )
}