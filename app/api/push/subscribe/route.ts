import { NextResponse } from 'next/server'
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
      return NextResponse.json(
  {
    success: false,
    error: 'Invalid subscription',
  },
  {
    status: 400,
  }
)
    }

    // Remove stale subscriptions for this user
if (sub.user_id) {
  const { error: deleteError } = await supabaseAdmin
    .from("push_subscriptions")
    .delete()
    .eq("user_id", sub.user_id)
    .neq("endpoint", sub.endpoint);

  if (deleteError) {
    console.error(
      "Failed cleaning old subscriptions:",
      deleteError
    );
  }
}

// Insert or update current subscription
const { data, error } = await supabaseAdmin
  .from("push_subscriptions")
  .upsert(
    [
      {
        user_id: sub.user_id,
        endpoint: sub.endpoint,
        p256dh: sub.keys?.p256dh ?? null,
        auth: sub.keys?.auth ?? null,
      },
    ],
    {
      onConflict: "endpoint",
    }
  )
  .select();

if (error) {
  console.error("🔥 Supabase subscription error:", error);

  return NextResponse.json(
    {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    },
    {
      status: 500,
    }
  );
}

    console.log('✅ Stored successfully:', data)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (err: any) {
  console.error("🔥 Route error:", err);

  return NextResponse.json(
    {
      success: false,
      message: err.message,
      stack: err.stack,
    },
    {
      status: 500,
    }
  );
}
}