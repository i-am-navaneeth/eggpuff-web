'use client'

import {
  motion,
  AnimatePresence,
} from 'framer-motion'

import {
  useState,
  useEffect,
  useRef,
} from 'react'

import {
  useRouter,
  useSearchParams,
} from 'next/navigation'

export default function BrowserModal() {

  const router = useRouter()

  const searchParams =
    useSearchParams()

  const url =
    searchParams.get('url')

  const domain =
    searchParams.get('domain') ||
    'Website'

const blockedDomains = [
  'instagram.com',
  'www.instagram.com',
  'threads.com',
  'threads.net',
  'x.com',
  'twitter.com',
  'facebook.com',
]

const isBlockedSite =
  blockedDomains.some(d =>
    url?.includes(d)
  )

const [blocked, setBlocked] =
  useState(isBlockedSite)



const [loaded, setLoaded] =
  useState(false)

const iframeRef =
  useRef<HTMLIFrameElement>(null)

useEffect(() => {

  const timer = setTimeout(() => {

    if (!loaded) {
      setBlocked(true)
      return
    }

    try {

      iframeRef.current
        ?.contentWindow
        ?.document

    } catch {

      setBlocked(true)
    }

  }, 3500)

  return () =>
    clearTimeout(timer)

}, [loaded, url])


useEffect(() => {

  if (isBlockedSite) {
    setBlocked(true)
    return
  }

  const timer = setTimeout(() => {

    if (!loaded) {
      setBlocked(true)
    }

  }, 4000)

  return () =>
    clearTimeout(timer)

}, [loaded, isBlockedSite])

  if (!url) return null

  return (
    <AnimatePresence>

      {/* BACKDROP */}
      <motion.div
        key="browser-backdrop"

        initial={{
          opacity: 0,
        }}

        animate={{
          opacity: 1,
        }}

        exit={{
          opacity: 0,
        }}

        onClick={() =>
          router.back()
        }

        style={{
          position: 'fixed',
          inset: 0,

          background:
            'rgba(0,0,0,0.32)',

          backdropFilter:
            'blur(2px)',

          zIndex: 999999,
        }}
      />

      {/* SHEET */}
      <motion.div
        key="browser-sheet"

        drag="y"

        dragConstraints={{
          top: 0,
          bottom: 320,
        }}

        dragElastic={0.12}

        onDragEnd={(_, info) => {

          if (
            info.offset.y > 120
          ) {
            router.back()
          }
        }}

        initial={{
          y: '100%',
        }}

        animate={{
          y: 0,
        }}

        exit={{
          y: '100%',
        }}

        transition={{
          type: 'spring',
          damping: 28,
          stiffness: 240,
        }}

        style={{
          position: 'fixed',
          inset: 0,

          background: '#fff',

          zIndex: 1000000,

          overflow: 'hidden',

          display: 'flex',
          flexDirection: 'column',
        }}
      >

        {/* HANDLE */}
        <div
          style={{
            width: 0,
            height: 5,

            borderRadius: 999,

            background: '#D1D5DB',

            alignSelf: 'center',

            marginTop: 10,
            marginBottom: 8,

            flexShrink: 0,
          }}
        />

        {/* TOPBAR */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',

            gap: 14,

            padding:
              '0 18px 14px',

            borderBottom:
              '1px solid #F1F5F9',

            flexShrink: 0,
          }}
        >

          {/* CLOSE */}
          <button
            onClick={() =>
              router.back()
            }
            style={{
              border: 'none',

              background:
                'transparent',

              fontSize: 32,

              lineHeight: 1,

              cursor: 'pointer',

              padding: 0,

              color: '#111827',
            }}
          >
            ×
          </button>

          {/* DOMAIN */}
          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontWeight: 700,

                fontSize: 15,

                color: '#0F172A',

                whiteSpace:
                  'nowrap',

                overflow: 'hidden',

                textOverflow:
                  'ellipsis',
              }}
            >
              {domain}
            </div>

            <div
              style={{
                fontSize: 12,

                color: '#6B7280',

                marginTop: 2,
              }}
            >
              Opened inside EggPuff
            </div>
          </div>

        </div>

        {/* BLOCKED UI */}
        {blocked ? (

          <div
            style={{
              flex: 1,

              display: 'flex',
              flexDirection: 'column',

              alignItems: 'center',
              justifyContent: 'center',

              padding: 24,

              textAlign: 'center',
            }}
          >

            <div
              style={{
                fontSize: 16,

                color: '#64748B',

                lineHeight: 1.5,

                marginBottom: 30,
              }}
            >
              Oops! Failed to load.
            </div>

            <button
              onClick={() =>
                window.open(
                  url,
                  '_blank'
                )
              }
              style={{
                background:
                  '#0F172A',

                color: '#fff',

                border: 'none',

                borderRadius: 999,

                padding:
                  '16px 28px',

                fontWeight: 700,

                fontSize: 17,

                cursor: 'pointer',

                boxShadow:
                  '0 8px 24px rgba(15,23,42,0.18)',
              }}
            >
              Open in Browser
            </button>

          </div>

        ) : (

          <iframe
  ref={iframeRef}
  src={url}
  onLoad={() => setLoaded(true)}
  onError={() => setBlocked(true)}

  style={{
    flex: 1,

    border: 'none',

    width: '100%',

    background: '#fff',
  }}
/>

        )}

      </motion.div>

    </AnimatePresence>
  )
}