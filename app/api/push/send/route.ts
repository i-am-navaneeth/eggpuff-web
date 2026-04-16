import { NextResponse } from 'next/server'
import { sendPushToUser } from '@/lib/push'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { userId, title, message, url } = body

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      )
    }

    await sendPushToUser(userId, title, message, url)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUSH API ERROR:', err)

    return NextResponse.json(
      { error: 'Push failed' },
      { status: 500 }
    )
  }
}