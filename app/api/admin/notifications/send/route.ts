import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notify } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const title = payload.title?.trim() ?? "";
    const body = payload.body?.trim() ?? "";
    const link = payload.link?.trim() || null;

    /* ==========================================================
       Validation
    ========================================================== */

    if (!title || !body) {
      return NextResponse.json(
        {
          error: "Title and body are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (title.length > 120) {
      return NextResponse.json(
        {
          error: "Title must be 120 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    if (body.length > 500) {
      return NextResponse.json(
        {
          error: "Body must be 500 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    if (link) {
      try {
        new URL(link);
      } catch {
        return NextResponse.json(
          {
            error: "Invalid link.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* ==========================================================
       Send Notifications
    ========================================================== */

    const { data: sentCount, error } =
      await supabaseAdmin.rpc(
        "send_notification_to_everyone",
        {
          p_title: title,
          p_body: body,
          p_link: link,
        }
      );

      
    if (error) {
  console.error(
    "Notification RPC failed:",
    error
  );

  return NextResponse.json(
    {
      error: "Failed to send notifications.",
    },
    {
      status: 500,
    }
  );
}

/* ==========================================================
   Save Notification History
========================================================== */

const { error: historyError } =
  await supabaseAdmin
    .from("notification_history")
    .insert({
      title,
      body,
      link,
      audience: "everyone",
      status: "sent",
      recipient_count: sentCount ?? 0,
      source: "manual",
      created_by: null, // We'll improve this next
    });

if (historyError) {
  console.error(
    "Failed to save notification history:",
    historyError
  );
}

/* ==========================================================
   Browser Push
========================================================== */

await notify("ADMIN_NOTIFICATION", {
  title,
  message: body,
});

    /* ==========================================================
       Success
    ========================================================== */

    return NextResponse.json({
      success: true,
      sent: sentCount,
      title,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "Notification API Error:",
      error
    );

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}