import { sendPushToAll } from './push'

export async function notify(event: string, payload: any) {
  switch (event) {
    /* ---------------- IPL ---------------- */
    case 'IPL_FOUR':
      return sendPushToAll('🔥 FOUR!', payload.message)

    case 'IPL_SIX':
      return sendPushToAll('🚀 SIX!', payload.message)

    case 'IPL_WICKET':
      return sendPushToAll('💥 WICKET!', payload.message)

    case 'IPL_START':
      return sendPushToAll('🏏 Match Started', payload.message)

    /* ---------------- QUESTIONS ---------------- */
    case 'NEW_QUESTION':
      return sendPushToAll('❓ New Question', payload.message)

    case 'NEW_ANSWER':
      return sendPushToAll('💬 New Answer', payload.message)

    /* ---------------- ADMIN ---------------- */
    case 'ADMIN_ALERT':
      return sendPushToAll('⚠️ Alert', payload.message)

    default:
      return
  }
}