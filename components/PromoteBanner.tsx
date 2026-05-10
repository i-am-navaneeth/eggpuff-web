'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { rewardForPyp } from '@/lib/rewards'

type Props = {
  link?: string
  links?: string[]
}

function detectPlatform(link: string) {
  const url = link.toLowerCase()

  if (url.includes('instagram.com')) {
    return { icon: '📸', label: 'Instagram' }
  }

  if (url.includes('facebook.com')) {
    return { icon: 'ⓕ', label: 'Facebook' }
  }

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return { icon: '▶️', label: 'YouTube' }
  }

  if (url.includes('twitter.com') || url.includes('x.com')) {
    return { icon: '𝕏', label: 'X (Twitter)' }
  }

  return { icon: '🔗', label: 'External profile' }
}

export default function PromoteBanner({ link, links }: Props) {
  const promoLinks =
    links && links.length > 0
      ? links
      : link
      ? [link]
      : []

  // Hard guard
  if (!promoLinks.length) return null

  /* ---------------- INFINITE LOOP SETUP ---------------- */

  const hasMultiple = promoLinks.length > 1

  const extended = hasMultiple
    ? [
        promoLinks[promoLinks.length - 1],
        ...promoLinks,
        promoLinks[0],
      ]
    : promoLinks

  const [current, setCurrent] = useState(hasMultiple ? 1 : 0)
  const [isPaused, setIsPaused] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef<number | null>(null)

  const [claimed, setClaimed] = useState<Record<string, boolean>>({})
  const clickStart = useRef<Record<string, number>>({})

  /* ---------------- AUTO SLIDE ---------------- */

  useEffect(() => {
    if (!hasMultiple || isPaused) return

    const interval = setInterval(() => {
      setCurrent(prev => prev + 1)
    }, 4000)

    return () => clearInterval(interval)
  }, [hasMultiple, isPaused])

  /* ---------------- RESET WHEN LINKS CHANGE ---------------- */

  useEffect(() => {
    if (!hasMultiple) {
      setCurrent(0)
    } else {
      setCurrent(1)
    }
  }, [promoLinks.length])

  /* ---------------- SEAMLESS INFINITE RESET ---------------- */

  useEffect(() => {
    if (!hasMultiple) return

    const handleTransitionEnd = () => {
      if (current === extended.length - 1) {
        setIsTransitioning(false)
        setCurrent(1)
      }

      if (current === 0) {
        setIsTransitioning(false)
        setCurrent(extended.length - 2)
      }
    }

    const node = containerRef.current
    node?.addEventListener('transitionend', handleTransitionEnd)

    return () => {
      node?.removeEventListener('transitionend', handleTransitionEnd)
    }
  }, [current, extended.length, hasMultiple])

  useEffect(() => {
    if (!isTransitioning) {
      requestAnimationFrame(() => {
        setIsTransitioning(true)
      })
    }
  }, [isTransitioning])

  /* ---------------- SWIPE SUPPORT ---------------- */

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setIsPaused(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return

    const diff = startX.current - e.touches[0].clientX

    if (diff > 50) {
      setCurrent(prev => prev + 1)
      startX.current = null
    }

    if (diff < -50) {
      setCurrent(prev => prev - 1)
      startX.current = null
    }
  }

  const handleTouchEnd = () => {
    startX.current = null
    setIsPaused(false)
  }

  const handleClick = (url: string) => {
  if (claimed[url]) return

  clickStart.current[url] = Date.now()

  window.open(url, '_blank')
}

// 🔥 detect return to app
useEffect(() => {
  const handleVisibility = async () => {
    if (document.visibilityState !== 'visible') return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    for (const url of Object.keys(clickStart.current)) {
      const start = clickStart.current[url]
      if (!start || claimed[url]) continue

      const diff = Date.now() - start

      if (diff >= 10000) {
        // 🔥 backend reward
        const res = await rewardForPyp(user.id, url)

        if (res?.success) {
          setClaimed(prev => ({ ...prev, [url]: true }))
        }
      }

      delete clickStart.current[url]
    }
  }

  document.addEventListener('visibilitychange', handleVisibility)

  return () => {
    document.removeEventListener('visibilitychange', handleVisibility)
  }
}, [claimed])

useEffect(() => {
  const loadClaimed = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from('pyp_clicks')
      .select('pyp_id')
      .eq('user_id', user.id)

    const map: Record<string, boolean> = {}
    data?.forEach((row: any) => {
      map[row.pyp_id] = true
    })

    setClaimed(map)
  }

  loadClaimed()
}, [])

  /* ---------------- UI ---------------- */

  return (
    <div
      style={{
        marginTop: 24,
        overflow: 'hidden',
      }}
    >
      {/* SLIDER */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'flex',
          transform: `translateX(-${current * 100}%)`,
          transition: isTransitioning
            ? 'transform 0.6s ease'
            : 'none',
        }}
      >
        {extended.map((item: any, index) => {
  const url = item.link || item
  const creator = item.creator
  const platform = detectPlatform(url)

          return (
            <div
  key={index}
  onClick={() => {
  if (claimed[url]) return
  handleClick(url)
}}
  style={{
    minWidth: '100%',
    flexShrink: 0,
    cursor: claimed[url] ? 'default' : 'pointer',
opacity: claimed[url] ? 0.6 : 1,
  }}
>
              <div
                style={{
                  padding: 18,
                  borderRadius: 18,
                  background: '#FFF5EE',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  border: '1px solid #FED7AA',
                  textAlign: 'center',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'translateY(-2px)'
  e.currentTarget.style.boxShadow = '0 10px 28px rgba(0, 0, 0, 0.08)'
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'translateY(0)'
  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.06)'
}}
              >
                {/* HEADER */}
                {/* CREATOR HEADER */}
{creator && (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 6,
    }}
  >
    <img
      src={creator.avatar_url || '/default-avatar.png'}
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        objectFit: 'cover',
      }}
    />

    <div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    lineHeight: 1.2,
  }}
>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#111827',
        }}
      >
        {creator.name}
      </span>

      <span
        style={{
          fontSize: 11,
          color: '#6B7280',
        }}
      >
        @{creator.username}
      </span>
    </div>
  </div>
)}

<div
  style={{
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 999,
    background: '#FFE0B2',
    fontWeight: 600,
  }}
>
  Promoted
</div>

                {/* PLATFORM */}
                <div
                  style={{
                    marginTop: 10,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      height: 20,
                      lineHeight: 1,
                    }}
                  >
                    {platform.icon}
                  </span>

                  <span style={{ lineHeight: 1 }}>
                    {platform.label}
                  </span>
                </div>

                {/* CTA */}
                <div
  style={{
    minHeight: 48, // ✅ keeps space fixed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  {claimed[url] ? (
    <div
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: '#16A34A',
      }}
    >
      +0.5 EP earned 🎉
    </div>
  ) : (
    <>
      <div
        style={{
          background: '#F4B860',
          color: '#111827',
          padding: '6px 14px',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        Tap to view profile →
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 11,
          color: '#16A34A',
          fontWeight: 500,
        }}
      >
        Earn +0.5 EP by supporting 💡
      </div>
    </>
  )}
</div>

                {/* NOTE */}
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 11,
                    opacity: 0.55,
                    lineHeight: 1.4,
                  }}
                >
                  This content is hosted outside EggPuff.
                  <br />
                  View responsibly.
                </div>
              </div>
              {claimed[url] && (
  <div
    style={{
      position: 'absolute',
      bottom: 10,
      right: 14,
      fontSize: 11,
      color: '#16A34A',
      fontWeight: 600,
    }}
  >
    +0.5 EP
  </div>
)}
            </div>
          )
        })}
      </div>

      {/* DOTS */}
      {hasMultiple && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            marginTop: 12,
            marginBottom: 0,
          }}
        >
          {promoLinks.map((_, i) => {
            const active =
              (current - 1 + promoLinks.length) %
                promoLinks.length ===
              i

            return (
              <div
                key={i}
                style={{
                  width: active ? 14 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: active
                    ? '#F4B860'
                    : '#E5E7EB',
                  transition: 'all 0.3s ease',
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
