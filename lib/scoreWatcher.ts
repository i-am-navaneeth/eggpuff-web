import { sendPushToAll } from './push'

let lastScore = ''
let lastStatus = ''

export async function checkScoreAndNotify() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/ipl-score`, {
      cache: 'no-store',
    })

    const data = await res.json()
    if (!data) return

    const newScore = `${data.score1}-${data.score2}`
    const newStatus = data.status?.toLowerCase() || ''

    /* ---------------- MATCH START ---------------- */
    if (
      lastStatus &&
      !lastStatus.includes('live') &&
      newStatus.includes('live')
    ) {
      await broadcast(
        '🏏 IPL Match Started',
        `${data.team1} vs ${data.team2}`
      )
    }

    /* ---------------- SCORE CHANGE ---------------- */
    if (lastScore && lastScore !== newScore) {
      const prevRuns =
        parseInt(lastScore.split('/')[0]?.replace(/\D/g, '')) || 0

      const currRuns =
        parseInt(data.score1.split('/')[0]?.replace(/\D/g, '')) || 0

      const diff = currRuns - prevRuns

      if (diff === 4) {
        await broadcast(
          '🔥 FOUR!',
          `${data.team1} hits a boundary`
        )
      } else if (diff === 6) {
        await broadcast(
          '🚀 SIX!',
          `${data.team1} goes BIG!`
        )
      } else {
        await broadcast(
          '⚡ Score Update',
          `${data.team1} ${data.score1}`
        )
      }
    }

    /* ---------------- MATCH END ---------------- */
    if (
      lastStatus &&
      !lastStatus.includes('won') &&
      newStatus.includes('won')
    ) {
      await broadcast('🏁 Match Finished', data.status)
    }

    lastScore = data.score1
    lastStatus = newStatus
  } catch (err) {
    console.error('Watcher error:', err)
  }
}

async function broadcast(title: string, body: string) {
  await sendPushToAll(title, body)
}