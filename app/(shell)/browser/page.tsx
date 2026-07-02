'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function BrowserPage() {

  const searchParams =
    useSearchParams()

  const url =
    searchParams.get('url')

  const domain =
    searchParams.get('domain')

  const [blocked, setBlocked] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    const timer = setTimeout(() => {

      // 🔥 most blocked sites never fully load
      setBlocked(true)

      setLoading(false)

    }, 3500)

    return () =>
      clearTimeout(timer)

  }, [])

  if (!url) return null

  return (

    <div
      style={{
        width: '100%',
        height: '100vh',
        background: '#fff',
        overflow: 'hidden',
        position: 'relative',
      }}
    >

      {/* WEBVIEW */}
      {!blocked && (

        <iframe
          src={url}

          onLoad={() => {
            setLoading(false)
          }}

          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: '#fff',
          }}

          sandbox="
            allow-same-origin
            allow-scripts
            allow-popups
            allow-forms
          "
        />

      )}

      {/* LOADER */}
      {loading && !blocked && (

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
          }}
        >

          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              border:
                '3px solid #E5E7EB',
              borderTop:
                '3px solid #111827',
              animation:
                'spin 0.7s linear infinite',
            }}
          />

        </div>

      )}

      {/* PREMIUM FALLBACK */}
      {blocked && (

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, #FFFFFF, #FAFAFA)',

            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',

            padding: 28,
            textAlign: 'center',
          }}
        >

          {/* SUBTEXT */}
          <div
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: '#6B7280',
              maxWidth: 320,
              marginBottom: 34,
            }}
          >
            Oops! Failed to load.
          </div>

          {/* BUTTON */}
          <button
            onClick={() => {
              window.open(
                url,
                '_blank'
              )
            }}
            style={{
              border: 'none',

              background:
                '#111827',

              color: '#fff',

              padding:
                '15px 24px',

              borderRadius: 999,

              fontSize: 15,
              fontWeight: 700,

              cursor: 'pointer',

              minWidth: 210,

              boxShadow:
                '0 10px 24px rgba(17,24,39,0.18)',
            }}
          >
            Open in Browser
          </button>

        </div>

      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

    </div>
  )
}