import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const title = payload.title?.trim() ?? "";
    const body = payload.body?.trim() ?? "";
    const link = payload.link?.trim() || null;
    const scheduledFor = payload.scheduledFor;

    /* ==========================================================
       Validation
    ========================================================== */

    if (!title || !body || !scheduledFor) {
      return NextResponse.json(
        {
          error: "Title, body and scheduled time are required.",
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

    const scheduleDate = new Date(scheduledFor);

    if (isNaN(scheduleDate.getTime())) {
      return NextResponse.json(
        {
          error: "Invalid schedule date.",
        },
        {
          status: 400,
        }
      );
    }

    if (scheduleDate <= new Date()) {
      return NextResponse.json(
        {
          error: "Schedule time must be in the future.",
        },
        {
          status: 400,
        }
      );
    }

    /* ==========================================================
       Save Schedule
    ========================================================== */

    const { data, error } = await supabaseAdmin
  .from("notification_schedule")
  .insert({
  title,
  body,
  link,
  audience: "everyone",
  scheduled_for: scheduleDate.toISOString(),
  status: "pending",
})
  .select()
  .single();

    if (error) {
      console.error("Schedule insert failed:", error);

      return NextResponse.json(
  {
    error: error.message,
    details: error,
  },
  {
    status: 500,
  }
);
    }

    /* ==========================================================
       Success
    ========================================================== */

    return NextResponse.json({
      success: true,
      schedule: data,
    });

  } catch (error) {
    console.error("Schedule API Error:", error);

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