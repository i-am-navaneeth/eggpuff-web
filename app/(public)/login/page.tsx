'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const words = [
    'campus',
    'students',
    'ideas',
    'questions',
    'answers',
    'curiosity',
  ]

  const [index, setIndex] = useState(0)
  const [animate, setAnimate] = useState(true)
  const [loading, setLoading] = useState(false)

  const loopWords = [...words, ...words]

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => prev + 1)
    }, 2200)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (index === words.length) {
      const timeout = setTimeout(() => {
        setAnimate(false)
        setIndex(0)

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimate(true)
          })
        })
      }, 400)

      return () => clearTimeout(timeout)
    }
  }, [index, words.length])

  // 🔥 Handle Google login properly
  const handleLogin = async () => {
  setLoading(true)

  const redirectUrl = `${window.location.origin}/feed`

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  })

  if (error) {
    alert(error.message)
    setLoading(false)
  }
}
  // ✅ On success → Supabase redirects → AuthProvider handles routing

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        background: '#f5f5f5',
      }}
    >
      {/* Logo */}
      <h1
        style={{
          fontSize: 34,
          fontWeight: 650,
          letterSpacing: '-0.6px',
          marginBottom: 8,
        }}
      >
        EggPuff <span>🥐</span>
      </h1>

      {/* Connecting Animation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          height: 24,
          overflow: 'hidden',
          marginBottom: 28,
          fontSize: 16,
          color: '#6B7280',
          fontWeight: 500,
        }}
      >
        <span style={{ lineHeight: '24px' }}>Connecting</span>

        <div
          style={{
            height: 24,
            overflow: 'hidden',
            fontWeight: 600,
            color: '#374151',
            lineHeight: '24px',
          }}
        >
          <div
            style={{
              transform: `translateY(-${index * 24}px)`,
              transition: animate ? 'transform 0.4s ease' : 'none',
              willChange: 'transform',
            }}
          >
            {loopWords.map((word, i) => (
              <div key={`${word}-${i}`} style={{ height: 24 }}>
                {word}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Google Button */}
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: 280,
          padding: '14px 20px',
          borderRadius: 16,
          border: 'none',
          background: '#F4B860',
          color: '#111827',
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
          opacity: loading ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
  if (!loading) {
    e.currentTarget.style.backgroundColor = '#E9A94F'
    e.currentTarget.style.transform = 'translateY(-2px)'
  }
}}
onMouseLeave={(e) => {
  if (!loading) {
    e.currentTarget.style.backgroundColor = '#F4B860'
    e.currentTarget.style.transform = 'translateY(0)'
  }
}}
      >
        {loading ? 'Connecting...' : 'Continue with Google'}
      </button>
    </div>
  )
}