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
  if (!url) return

  let timeout: ReturnType<typeof setTimeout>

  try {
    const parsed = new URL(url)

    if (
      parsed.protocol !== 'https:' &&
      parsed.protocol !== 'http:'
    ) {
      setBlocked(true)
      setLoading(false)
      return
    }
  } catch {
    setBlocked(true)
    setLoading(false)
    return
  }

  timeout = setTimeout(() => {
    if (loading) {
      setBlocked(true)
      setLoading(false)
    }
  }, 5000)

  return () => clearTimeout(timeout)
}, [url, loading])

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

    // Instagram, LinkedIn, X, Facebook and many
    // other sites block embedding but still fire onLoad.
    // Show the fallback for known blocked domains.
    if (
      /instagram|facebook|linkedin|x\.com|twitter|threads/i.test(url)
    ) {
      setBlocked(true)
    }
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
        'linear-gradient(to bottom,#FFFFFF,#FAFAFA)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 28,
      textAlign: 'center',
    }}
  >

    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: '#FFF7E8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 34,
        marginBottom: 20,
      }}
    >
      🌐
    </div>

    <div
      style={{
        fontSize: 20,
        fontWeight: 700,
        color: '#111827',
        marginBottom: 8,
      }}
    >
      Couldn't preview {domain ?? 'this website'}
    </div>

    <div
      style={{
        fontSize: 14,
        lineHeight: 1.7,
        color: '#6B7280',
        maxWidth: 320,
        marginBottom: 28,
      }}
    >
      You can continue in your browser instead.
    </div>

    <button
      onClick={() => {
        window.location.href = url
      }}
      style={{
        border: 'none',
        background: '#111827',
        color: '#FFFFFF',
        padding: '15px 26px',
        borderRadius: 999,
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
        minWidth: 220,
        boxShadow:
          '0 10px 24px rgba(17,24,39,.18)',
      }}
    >
      Open in browser
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