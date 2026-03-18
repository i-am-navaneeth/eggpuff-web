import { sendPushToAll } from '../../lib/push'

let lastScore = ''
let lastStatus = ''

export async function handler() {
  try {
    const res = await fetch('https://yourdomain.com/api/ipl-score')
    const data = await res.json()

    if (!data) return { statusCode: 200 }

    const newScore = `${data.score1}-${data.score2}`
    const newStatus = data.status?.toLowerCase() || ''

    /* MATCH START */
    if (!lastStatus.includes('live') && newStatus.includes('live')) {
      await sendPushToAll('🏏 IPL Match Started', `${data.team1} vs ${data.team2}`)
    }

    /* SCORE CHANGE */
    if (lastScore && lastScore !== newScore) {
      await sendPushToAll('⚡ Score Update', `${data.team1} ${data.score1}`)
    }

    /* MATCH END */
    if (!lastStatus.includes('won') && newStatus.includes('won')) {
      await sendPushToAll('🏁 Match Finished', data.status)
    }

    lastScore = newScore
    lastStatus = newStatus

    return {
      statusCode: 200,
      body: 'ok',
    }
  } catch (err) {
    console.error(err)
    return { statusCode: 500 }
  }
}