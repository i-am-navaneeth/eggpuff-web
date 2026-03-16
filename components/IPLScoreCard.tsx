'use client'

import { useEffect, useState } from 'react'
import { saveScore, loadScore } from '@/lib/scoreCache'

type Match = {
  team1: string
  team2: string
  score1: string
  score2: string
  status: string
}

export default function IPLScoreCard() {
  const [match, setMatch] = useState<Match | null>(null)

  const fetchScore = async () => {
    try {
      const res = await fetch('/api/ipl-score')
      const data = await res.json()

      if (data) {
        setMatch(data)
        saveScore(data)
      }
    } catch (err) {
      const cached = loadScore()
      if (cached) setMatch(cached)
    }
  }

  useEffect(() => {
  const fetchScore = async () => {
    try {
      const res = await fetch('/api/ipl-score')
      const data = await res.json()
      setMatch(data)
    } catch {
      console.log("score fetch failed")
    }
  }

  fetchScore()

  const interval = setInterval(fetchScore, 900000)

  return () => clearInterval(interval)
}, [])

 if (!match) {
  return (
    <div style={{ padding: 20 }}>
      Loading IPL score...
    </div>
  )
}

  return (
    <>
      <style>
        {`
        .live-dot {
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          display: inline-block;
          animation: liveBlink 1.2s infinite;
        }

        @keyframes liveBlink {
          0% { opacity: 1 }
          50% { opacity: 0.3 }
          100% { opacity: 1 }
        }
        `}
      </style>

      <div
        style={{
          border: '1px solid #E5E7EB',
          borderRadius: 16,
          padding: 18,
          background: '#FFFFFF',
          marginBottom: 20,
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span className="live-dot"></span>
          IPL Live
        </div>

        <div style={{ fontSize: 16, fontWeight: 600 }}>
          {match.team1} vs {match.team2}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 6,
            fontSize: 15,
          }}
        >
          <span>{match.score1}</span>
          <span>{match.score2}</span>
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            color: '#6B7280',
          }}
        >
          {match.status}
        </div>
      </div>
    </>
  )
}