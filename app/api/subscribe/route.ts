import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const sub = await req.json()

    console.log('📥 Incoming subscription:', sub)

    // ✅ Basic validation (keeps your logic safe)
    if (!sub || !sub.endpoint) {
      console.error('❌ Invalid subscription object')
      return NextResponse.json({
        success: false,
        error: 'Invalid subscription',
      })
    }

    // ✅ Insert into DB
    const { data, error } = await supabase
      .from('push_subscriptions')
      .insert([
        {
          subscription: sub,
        },
      ])
      .select() // 👈 helps debug + confirms insert

    if (error) {
      console.error(
        '❌ Supabase error FULL:',
        JSON.stringify(error, null, 2)
      )

      return NextResponse.json({
        success: false,
        error,
      })
    }

    console.log('✅ Stored successfully:', data)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (err) {
    console.error('❌ Route error:', err)

    return NextResponse.json({
      success: false,
      error: err,
    })
  }
}