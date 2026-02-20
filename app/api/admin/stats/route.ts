import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
  },
})

export async function GET() {
  try {
    const fiveMinutesAgo = new Date(
      Date.now() - 2 * 60 * 1000
    ).toISOString()

    /* 🔴 Live Users (active in last 5 mins) */
    const {
      count: liveCount,
      error: liveError,
    } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('last_active_at', fiveMinutesAgo)

    if (liveError) {
      console.error('LIVE COUNT ERROR:', liveError)
      throw liveError
    }

    /* 👥 Total Users */
    const {
      count: totalCount,
      error: totalError,
    } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('TOTAL COUNT ERROR:', totalError)
      throw totalError
    }

    return NextResponse.json({
      liveUsers: liveCount ?? 0,
      totalUsers: totalCount ?? 0,
    })
  } catch (err) {
    console.error('ADMIN STATS ERROR:', err)

    return NextResponse.json(
      { error: 'Failed to load stats' },
      { status: 500 }
    )
  }
}
