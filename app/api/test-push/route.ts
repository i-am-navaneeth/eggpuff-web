import { NextResponse } from 'next/server'
import { sendPushToAll } from '@/lib/push'

export async function GET() {
  await sendPushToAll('Test went SUCCESSFUL 🚀', 'It works perfectly!')

  return NextResponse.json({ success: true })
}