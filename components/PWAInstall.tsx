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
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        animation: 'slideUp 0.4s ease',
      }}
    >
      <div
        style={{
          background: '#111827',
          color: '#fff',
          borderRadius: 999,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        }}
      >
        {/* TEXT */}
        <span style={{ fontSize: 13 }}>
          Install EggPuff 🚀
        </span>

        {/* CTA */}
        <button
          onClick={install}
          style={{
            background: '#F4B860',
            border: 'none',
            borderRadius: 999,
            padding: '6px 14px',
            fontWeight: 600,
            cursor: 'pointer',
            animation: 'glow 1.5s infinite ease-in-out',
          }}
        >
          Install
        </button>

        {/* CLOSE */}
        <button
          onClick={() => setVisible(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9CA3AF',
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>

      {/* ANIMATIONS */}
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, 20px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }

          @keyframes glow {
            0% {
              box-shadow: 0 0 0px rgba(244,184,96,0.4);
            }
            50% {
              box-shadow: 0 0 12px rgba(244,184,96,0.8);
            }
            100% {
              box-shadow: 0 0 0px rgba(244,184,96,0.4);
            }
          }
        `}
      </style>
    </div>
  )
}