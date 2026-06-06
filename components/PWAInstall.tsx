'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PWAInstall() {
  const [prompt, setPrompt] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [visible, setVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  /* 🔐 CHECK LOGIN */
  useEffect(() => {
    const checkUser = async () => {
      const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

      setIsLoggedIn(!!user)
    }

    checkUser()
  }, [])

  /* 📱 DETECT INSTALLED */
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandalone) {
      setIsInstalled(true)
    }
  }, [])

  /* 📲 CAPTURE INSTALL PROMPT */
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () =>
      window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  /* 🧠 SMART DELAY + ONCE PER DAY */
  useEffect(() => {
    if (!prompt || !isLoggedIn || isInstalled) return

    const lastShown = localStorage.getItem('pwa_prompt_date')
    const today = new Date().toDateString()

    if (lastShown === today) return

    const timer = setTimeout(() => {
      setVisible(true)
      localStorage.setItem('pwa_prompt_date', today)
    }, 10000) // ⏱ 10 sec delay

    return () => clearTimeout(timer)
  }, [prompt, isLoggedIn, isInstalled])

  /* 🚀 INSTALL */
  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
    setVisible(false)
  }

  /* ❌ HIDE CONDITIONS */
  if (!prompt || !isLoggedIn || !visible || isInstalled) return null

return (
  <div
    style={{
      position: 'fixed',
      bottom:
        'max(20px, env(safe-area-inset-bottom))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      animation: 'slideUp 0.35s ease',
      width: 'calc(100vw - 32px)',
      maxWidth: 360,
      pointerEvents: 'auto',
    }}
  >
    <div
      style={{
        background:
          'linear-gradient(135deg, #0F172A 0%, #172554 100%)',

        color: '#fff',

        borderRadius: 24,

        padding: '14px 16px',

        display: 'flex',

        alignItems: 'center',

        gap: 14,

        boxShadow:
          '0 16px 40px rgba(0,0,0,0.24)',

        border:
          '1px solid rgba(255,255,255,0.06)',

        backdropFilter: 'blur(12px)',

        WebkitBackdropFilter:
          'blur(12px)',
      }}
    >
      {/* APP ICON */}
      <div
        style={{
          width: 48,
          height: 48,

          borderRadius: 14,

          overflow: 'hidden',

          flexShrink: 0,

          background: '#FFFFFF',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          boxShadow:
            '0 3px 10px rgba(0,0,0,0.12)',
        }}
      >
        <img
          src="/icon-512.png"
          alt="EggPuff"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>

      {/* TEXT */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 15,

            fontWeight: 700,

            color: '#FFFFFF',

            lineHeight: 1.15,

            letterSpacing: '-0.25px',
          }}
        >
          EggPuff
        </div>

        <div
          style={{
            fontSize: 12,

            color:
              'rgba(255,255,255,0.72)',

            marginTop: 3,

            lineHeight: 1.25,
          }}
        >
          Open instantly.
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={install}
        onTouchStart={(e) => {
          e.currentTarget.style.transform =
            'scale(0.97)'
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform =
            'scale(1)'
        }}
        style={{
          background: '#F4B860',

          color: '#111827',

          border: 'none',

          borderRadius: 999,

          padding: '11px 20px',

          fontWeight: 800,

          fontSize: 14,

          cursor: 'pointer',

          flexShrink: 0,

          transition:
            'transform .15s ease',

          boxShadow:
            '0 6px 18px rgba(244,184,96,0.28)',
        }}
      >
        Install
      </button>

      {/* CLOSE */}
      <button
        onClick={() =>
          setVisible(false)
        }
        aria-label="Close"
        style={{
          width: 30,
          height: 30,

          borderRadius: '50%',

          border: 'none',

          background:
            'rgba(255,255,255,0.08)',

          color:
            'rgba(255,255,255,0.7)',

          cursor: 'pointer',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          fontSize: 15,

          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>

    <style>
      {`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform:
              translate(-50%, 20px);
          }

          to {
            opacity: 1;
            transform:
              translate(-50%, 0);
          }
        }
      `}
    </style>
  </div>
)
}