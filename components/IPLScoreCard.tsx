'use client'

import { useEffect, useRef, useState } from 'react'
import { saveScore, loadScore } from '@/lib/scoreCache'
import { sendNotification, requestNotificationPermission } from '@/lib/iplNotifications'
import { isNotificationEnabled } from '@/lib/iplNotifications'

type Match = {
  team1: string
  team2: string
  score1: string
  score2: string
  status: string
}

export default function IPLScoreCard() {
  const [match, setMatch] = useState<Match | null>(null)
  const [highlight, setHighlight] = useState(false)
  const [notifyEnabled, setNotifyEnabled] = useState(false)
  const [justEnabled, setJustEnabled] = useState(false)
  const [hideToggle, setHideToggle] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [apiFailed, setApiFailed] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const prevStatusRef = useRef<string>('')
  const prevScoreRef = useRef<string>('')
  const lastNotifyRef = useRef<number>(0)

  const COOLDOWN = 60000

  useEffect(() => {
    const saved = localStorage.getItem('ipl_notify') === 'true'
    setNotifyEnabled(saved)
    if (saved) setHideToggle(true)

    audioRef.current = new Audio('/ipl.mp3')
audioRef.current.preload = 'auto'
audioRef.current.load()
  }, [])

  useEffect(() => {
  const saved = localStorage.getItem('ipl_notify') === 'true'
  setNotifyEnabled(saved)
  if (saved) setHideToggle(true)

  const audio = new Audio('/ipl.mp3')
  audio.preload = 'auto'
  audio.load()

  // 🔓 Unlock audio on first interaction
  const unlock = () => {
    audio.play().then(() => {
      audio.pause()
      audio.currentTime = 0
    }).catch(() => {})

    window.removeEventListener('click', unlock)
  }

  window.addEventListener('click', unlock)

  audioRef.current = audio
}, [])

  const toggleNotify = async () => {
    if (toggling) return
    setToggling(true)

    const newVal = !notifyEnabled

    // 🚀 1. INSTANT UI UPDATE
setNotifyEnabled(newVal)
localStorage.setItem('ipl_notify', newVal ? 'true' : 'false')

// 🔒 2. Prevent spam clicks
if (toggling) return
setToggling(true)

    try {
      if (newVal) {
        if (!('Notification' in window)) {
          alert('Notifications not supported')
          return
        }

        const permission = await Notification.requestPermission()

        if (permission !== 'granted') {
          alert('🔕 Notifications blocked')
          return
        }

    

        if (audioRef.current) {
          const audio = audioRef.current

          audio.currentTime = 2
          audio.volume = 1
          audio.play()

          setTimeout(() => {
            const fadeDuration = 500
            const steps = 20
            const stepTime = fadeDuration / steps

            let currentStep = 0

            const fade = setInterval(() => {
              if (!audio) return

              currentStep++
              audio.volume = Math.max(0, 1 - currentStep / steps)

              if (currentStep >= steps) {
                clearInterval(fade)
                audio.pause()
                audio.currentTime = 0
                audio.volume = 1
              }
            }, stepTime)
          }, 4500)
        }

        if ('vibrate' in navigator) navigator.vibrate(50)

        setJustEnabled(true)
        setTimeout(() => setJustEnabled(false), 4000)

        setTimeout(() => setHideToggle(true), 800)
      }

      setNotifyEnabled(newVal)
      localStorage.setItem('ipl_notify', newVal ? 'true' : 'false')
    } finally {
      setTimeout(() => setToggling(false), 400)
    }
  }

  const fetchScore = async () => {
    try {
      const res = await fetch('/api/ipl-score')
      const data = await res.json()

      if (!data || data.error || !data.team1 || !data.team2) {
        setMatch(null)
        setApiFailed(true)
        return
      }

      setApiFailed(false)

      const newScore = `${data.score1}-${data.score2}`
      if (prevScoreRef.current && prevScoreRef.current !== newScore) {
        setHighlight(true)
        setTimeout(() => setHighlight(false), 800)
      }

      prevScoreRef.current = newScore

      setMatch(data)
      saveScore(data)
    } catch {
      setApiFailed(true)
      const cached = loadScore()
      if (cached) setMatch(cached)
    }
  }

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  useEffect(() => {
    fetchScore()
    const interval = setInterval(fetchScore, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div
        className={highlight ? 'score-flash' : ''}
        style={{
          border: notifyEnabled ? '1px solid #10B981' : '1px solid #E5E7EB',
          borderRadius: 16,
          padding: 16,
          background: '#FFFFFF',
          marginBottom: 20,
          fontSize: 14,
          color: '#374151',
          boxShadow: notifyEnabled
            ? '0 0 0 2px rgba(16,185,129,0.15)'
            : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="ball-wrapper">
              <span className="ball"></span>
              <span className="dust"></span>
              <span className="ground"></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              {match && match.team1 && match.team2 ? (
                <span style={{ fontWeight: 600 }}>
                  {match.team1} vs {match.team2}
                </span>
              ) : (
                <>
                  <span style={{ fontWeight: 600 }}>
                    IPL Season Loading
                  </span>
                  <span
                    style={{
                      fontSize: 7,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: '#FEF3C7',
                      color: '#92400E',
                      marginLeft: 8,
                    }}
                  >
                    PRE-SEASON HYPE
                  </span>
                </>
              )}
            </div>
          </div>

          {!hideToggle && (
            <div
              onClick={toggleNotify}
              style={{
                width: 52,
                height: 26,
                borderRadius: 999,
                background: notifyEnabled ? '#10B981' : '#E5E7EB',
                position: 'relative',
                cursor: toggling ? 'not-allowed' : 'pointer',
                pointerEvents: toggling ? 'none' : 'auto',
                opacity: toggling ? 0.6 : 1,
                transition: 'all 0.25s ease',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: notifyEnabled ? 8 : 26,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 12,
                  transition: 'all 0.25s ease',
                  opacity: 0.8,
                }}
              >
                {notifyEnabled ? '🔔' : '🔕'}
              </span>

              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 3,
                  left: notifyEnabled ? 28 : 3,
                  transition: 'all 0.25s cubic-bezier(.4,1.6,.6,1)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
              />
            </div>
          )}
        </div>

        {/* SCORE OR MESSAGE */}
        {match ? (
          <>
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>{match.score1}</span>
              <span>{match.score2}</span>
            </div>

            <div style={{ marginTop: 6, fontSize: 13, color: '#6B7280' }}>
              {match.status}
            </div>
          </>
        ) : (
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
            Get ready for boundaries, wickets & madness 🎉
          </div>
        )}

        {justEnabled && (
          <div style={{ marginTop: 10, color: '#16a34a', fontSize: 10 }}>
           Live updates coming your way 🚀
          </div>
        )}

        {match && match.status?.toLowerCase().includes('live') && (
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() =>
                window.open('https://www.google.com/search?q=ipl+live+score')
              }
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: '1px solid #E5E7EB',
                background: '#F9FAFB',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              📊 Open Live Score
            </button>
          </div>
        )}
      </div>

      <style>
        {`
        .score-flash {
          animation: flash 0.8s ease;
        }

        @keyframes flash {
          0% { background-color: #fef3c7 }
          100% { background-color: transparent }
        }

        @keyframes liveFlow {
          0% { background-position: 0% 0 }
          100% { background-position: 200% 0 }
        }
        `}
      </style>
    </>
  )
}