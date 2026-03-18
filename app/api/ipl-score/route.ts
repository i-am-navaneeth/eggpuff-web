import { NextResponse } from 'next/server'

let cachedData: any = null
let lastFetchTime = 0

export async function GET() {
  const now = Date.now()

  // ⏱️ 15 min cache (saves API usage)
  if (cachedData && now - lastFetchTime < 900000) {
    return NextResponse.json(cachedData)
  }

  try {
    const res = await fetch(
      `https://api.cricketdata.org/v1/matches?apikey=${process.env.CRICKET_API_KEY}`,
      { cache: 'no-store' }
    )

    // ❌ API failed (rate limit / network)
    if (!res.ok) {
      console.error('API HTTP error:', res.status)
      return NextResponse.json(cachedData || { error: true })
    }

    const data = await res.json().catch(() => null)
    if (!data) {
      return NextResponse.json(cachedData || { error: true })
    }

    const matches = data?.data || []

    /* ========================================
       🔥 STRONG IPL DETECTION
    ======================================== */
    const IPL_SERIES_IDS = [
      'indian premier league',
      'ipl',
      'tata ipl',
    ]

    const iplMatches = matches.filter((m: any) => {
      const seriesName = String(
        m?.series || m?.name || ''
      ).toLowerCase()

      return IPL_SERIES_IDS.some(keyword =>
        seriesName.includes(keyword)
      )
    })

    /* ========================================
       🔴 FIND LIVE MATCH
    ======================================== */
    let selectedMatch = iplMatches.find((m: any) => {
      const status = String(m?.status || '').toLowerCase()

      return (
        status.includes('live') ||
        status.includes('innings') ||
        status.includes('in progress')
      )
    })

    /* ========================================
       🟡 FALLBACK → LATEST IPL MATCH
    ======================================== */
    if (!selectedMatch && iplMatches.length > 0) {
      selectedMatch = iplMatches[0]
    }

    /* ========================================
       ❌ NO IPL MATCH
    ======================================== */
    if (!selectedMatch) {
      return NextResponse.json(null)
    }

    const score1 = selectedMatch.score?.[0]
    const score2 = selectedMatch.score?.[1]

    const formatted = {
      team1: selectedMatch.teams?.[0] ?? null,
team2: selectedMatch.teams?.[1] ?? null,
      score1: score1
        ? `${score1.r}/${score1.w} (${score1.o})`
        : '—',
      score2: score2
        ? `${score2.r}/${score2.w} (${score2.o})`
        : '—',
      status: selectedMatch.status || 'Live',
    }

    // 💾 cache result
    cachedData = formatted
    lastFetchTime = now

    return NextResponse.json(formatted)
  } catch (err) {
    console.error('API error:', err)

    // ⚠️ fallback to last good data OR signal error
    return NextResponse.json(cachedData || { error: true })
  }
}