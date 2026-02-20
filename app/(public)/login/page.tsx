'use client'
import { useEffect, useState } from 'react'
import { signInWithGoogle } from '@/lib/auth'

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

  const loopWords = [...words, ...words]

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => prev + 1)
    }, 2200)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (index === words.length) {
      setTimeout(() => {
        setAnimate(false)
        setIndex(0)

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimate(true)
          })
        })
      }, 400)
    }
  }, [index, words.length])

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
          marginBottom: 8, // tighter spacing
        }}
      >
        EggPuff <span>🥐</span>
      </h1>

      {/* Connecting Animation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline', // ✅ fixes vertical misalignment
          gap: 6,
          height: 24,
          overflow: 'hidden',
          marginBottom: 28, // reduced gap before button
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
            }}
          >
            {loopWords.map((word, i) => (
              <div key={i} style={{ height: 24 }}>
                {word}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Google Button */}
      <button
        onClick={signInWithGoogle}
        style={{
          width: 280,
          padding: '14px 20px',
          borderRadius: 16,
          border: 'none',
          background: '#F4B860',
          color: '#111827',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#E9A94F'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#F4B860'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        Continue with Google
      </button>
    </div>
  )
}
