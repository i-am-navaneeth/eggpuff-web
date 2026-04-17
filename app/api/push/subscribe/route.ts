import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

// 🔥 ADMIN CLIENT (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // ✅ Get user (optional but useful)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // ✅ Insert into DB (refined + ADMIN CLIENT)
    const { data, error } = await supabaseAdmin
      .from('push_subscriptions')
      .insert([
        {
          user_id: sub.user_id ?? null,
          endpoint: sub.endpoint,
          p256dh: sub.keys?.p256dh ?? null,
          auth: sub.keys?.auth ?? null,
        },
      ])
      .select()

    console.log('INSERT RESULT:', data)
    console.log('INSERT ERROR:', error)

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