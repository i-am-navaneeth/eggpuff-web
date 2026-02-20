'use client'

import { useEffect, useRef, useState } from 'react'

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
        {extended.map((item, index) => {
          const platform = detectPlatform(item)

          return (
            <a
              key={index}
              href={item}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                minWidth: '100%',
                flexShrink: 0,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  padding: 18,
                  borderRadius: 18,
                  background: '#FFF5EE',
                  border: '1px solid #FED7AA',
                  textAlign: 'center',
                }}
              >
                {/* HEADER */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  ✨ Promoted
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: 11,
                      background: '#FFE0B2',
                      fontWeight: 600,
                    }}
                  >
                    Beta
                  </span>
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
                    marginTop: 10,
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#B45309',
                  }}
                >
                  Tap to view profile →
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
            </a>
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
            marginBottom: 32,
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
