'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {

  const [loading, setLoading] = useState(false)
  const [hasVisited, setHasVisited] = useState(false)

  useEffect(() => {
  const visited = localStorage.getItem('ep_visited')

  if (visited) {
    setHasVisited(true)
  } else {
    localStorage.setItem('ep_visited', 'true')
  }
}, [])

  // 🔥 Handle Google login properly
const handleLogin = async () => {
  setLoading(true)

  const redirectUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/feed`
      : 'http://localhost:3000/feed'

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
        background: '#FAFAFA',
      }}
    >
      {/* Glow */}
<div
  style={{
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  }}
>
  <div
    style={{
      position: 'absolute',
      width: 420,
      height: 420,
      left: '50%',
      top: 120,
      transform: 'translateX(-50%)',
      borderRadius: '50%',
      background:
        'radial-gradient(circle, rgba(244,184,96,.28) 0%, rgba(244,184,96,0) 70%)',
    }}
  />
</div>

{/* Login Card */}

<div
  style={{
    width: '100%',
    maxWidth: 360,
    background: 'rgba(255,255,255,.78)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    borderRadius: 30,
    padding: '42px 28px',
    boxShadow:
      '0 25px 60px rgba(0,0,0,.08), 0 2px 10px rgba(0,0,0,.04)',
    border: '1px solid rgba(255,255,255,.65)',
    zIndex: 1,
  }}
>

  <p
  style={{
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 600,
    color: '#9CA3AF',
    letterSpacing: '0.02em',
    marginBottom: 12,
  }}
>
  {hasVisited ? 'Welcome back to' : 'Welcome to'}
</p>

<img
  src="/icon-512.png"
  alt="EggPuff"
  style={{
    width: 60,
    height: 60,
    display: 'block',
    margin: '0 auto 18px',
  }}
/>

<h1
  style={{
    textAlign: 'center',
    fontSize: 40,
    fontWeight: 800,
    letterSpacing: '-1.5px',
    color: '#111827',
    marginBottom: 10,
  }}
>
  EggPuff
</h1>

  <p
  style={{
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 1.7,
    fontSize: 17,
    marginBottom: 34,
  }}
>
  Your campus. One place.
  <br />

  <span
    style={{
      color: '#111827',
      fontWeight: 600,
    }}
  >
    Ask. Answer. Grow together.
  </span>
</p>

  <button
  onClick={handleLogin}
  disabled={loading}
  style={{
    width: '100%',
    height: 58,
    border: 'none',
    borderRadius: 18,
    background: 'linear-gradient(135deg,#FFD15C,#FF9B22)',
    color: '#111827',
    fontWeight: 700,
    fontSize: 17,
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: '.2s',
    boxShadow: '0 12px 30px rgba(244,184,96,.35)',
    opacity: loading ? 0.7 : 1,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  }}
>
  {loading ? (
    'Connecting...'
  ) : (
    <>
      <svg
        width="22"
        height="22"
        viewBox="0 0 48 48"
      >
        <path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
          fill="#FF3D00"
          d="M6.306 14.691l6.571 4.819C14.655 16.108 19.002 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4c-7.682 0-14.347 4.337-17.694 10.691z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.145 35.091 26.715 36 24 36c-5.202 0-9.624-3.329-11.286-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303c-.798 2.237-2.293 4.166-4.284 5.57l.003-.002 6.19 5.238C36.774 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        />
      </svg>

      <span>Continue with Google</span>
    </>
  )}
</button>

  <div
  style={{
    marginTop: 18,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  }}
>
  <p
    style={{
      color: '#9CA3AF',
      fontSize: 12,
      lineHeight: 1.6,
      margin: 0,
    }}
  >
    By continuing, you agree to our{' '}
    <a
      href="/terms"
      style={{
        color: '#4B5563',
        fontWeight: 600,
        textDecoration: 'none',
      }}
    >
      Terms &amp; Conditions
    </a>{' '}
    and{' '}
    <a
      href="/privacy"
      style={{
        color: '#4B5563',
        fontWeight: 600,
        textDecoration: 'none',
      }}
    >
      Privacy Policy
    </a>
    .
  </p>

  
</div>

</div>
    </div>
  )
}