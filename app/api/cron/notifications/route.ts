import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notify } from "@/lib/notify";

export const runtime = "nodejs";

export async function GET() {
  try {
    /* ==========================================================
       Fetch Pending Notifications
    ========================================================== */

    const { data: schedules, error } = await supabaseAdmin
      .from("notification_schedule")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true });

    if (error) {
      console.error("Failed fetching schedules:", error);

      return NextResponse.json(
        { error: "Failed fetching schedules." },
        { status: 500 }
      );
    }

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
      });
    }

    let processed = 0;

    /* ==========================================================
       Process Every Pending Notification
    ========================================================== */

    for (const schedule of schedules) {
      try {
        // Insert notification rows
        const { error: rpcError } =
  await supabaseAdmin.rpc(
    "send_notification_to_everyone",
    {
      p_title: schedule.title,
      p_body: schedule.body,
      p_link: schedule.link,
      p_actor_id: schedule.created_by,
    }
  );

        if (rpcError) {
          console.error(
            "RPC failed:",
            rpcError
          );

          continue;
        }

        // Browser Push
        await notify("ADMIN_NOTIFICATION", {
          title: schedule.title,
          message: schedule.body,
        });

        // Mark as sent
        const { error: updateError } =
          await supabaseAdmin
            .from("notification_schedule")
            .update({
  status: "sent",
  sent_at: new Date().toISOString(),
})
            .eq("id", schedule.id);

        if (updateError) {
          console.error(
            "Failed updating schedule:",
            updateError
          );

          continue;
        }

        processed++;
      } catch (err) {
        console.error(
          "Schedule processing failed:",
          err
        );
      }
    }

    /* ==========================================================
       Success
    ========================================================== */

    return NextResponse.json({
      success: true,
      processed,
    });
  } catch (err) {
    console.error("Cron Error:", err);

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