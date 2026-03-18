import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const sub = await req.json()

    console.log('Incoming subscription:', sub)

    const { error } = await supabase
      .from('push_subscriptions')
      .insert({
        subscription: sub,
      })

    if (error) {
  console.error('❌ Supabase error FULL:', JSON.stringify(error, null, 2))
  return NextResponse.json({ success: false, error })
}

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Route error:', err)
    return NextResponse.json({ success: false })
  }
}