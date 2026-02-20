import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // 🔐 Use SERVICE ROLE (server-side only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1️⃣ Get pending payments
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (paymentError) {
      return NextResponse.json(
        { error: paymentError.message },
        { status: 500 }
      )
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json({ payments: [] })
    }

    // 2️⃣ Collect all user IDs
    const userIds = payments.map(p => p.user_id)

    // 3️⃣ Fetch emails directly from auth.users (secure)
    const { data: users, error: userError } =
      await supabase.auth.admin.listUsers()

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      )
    }

    // 4️⃣ Create lookup map
    const emailMap = new Map(
      users.users.map(u => [u.id, u.email])
    )

    // 5️⃣ Attach emails to payments
    const enrichedPayments = payments.map(p => ({
      ...p,
      email: emailMap.get(p.user_id) || null,
    }))

    return NextResponse.json({
      payments: enrichedPayments,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
