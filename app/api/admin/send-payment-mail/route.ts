import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // 🔐 Use SERVICE ROLE (server only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user email from auth.users
    const { data: userData, error } =
      await supabase.auth.admin.getUserById(userId)

    if (error || !userData?.user?.email) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 404 }
      )
    }

    const email = userData.user.email

    // 👉 Open Zoho compose link
    const subject = encodeURIComponent(
      'Your EggPuff payment is approved 🥐'
    )

    const body = encodeURIComponent(
`Hi 👋,

Your payment has been successfully approved!

5 🥐 EggPuffs have been credited to your account.

Thank you for supporting EggPuff 💝

We truly appreciate your support — you're helping us grow this campus community 🚀

If you enjoy EggPuff, please invite your friends!


– Team EggPuff`
    )

    const mailUrl =
      `https://mail.zoho.com/zm/#compose` +
      `?to=${email}&subject=${subject}&body=${body}`

    return NextResponse.json({ mailUrl })

  } catch (err) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
