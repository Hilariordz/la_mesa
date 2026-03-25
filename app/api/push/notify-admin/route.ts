import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { sendPushNotification } from "@/lib/web-push";

export async function POST(req: Request) {
  try {
    const { customerName, partySize, date, time } = await req.json();
    const supabase = getSupabaseAdminClient();

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("is_admin", true);

    for (const sub of subs ?? []) {
      await sendPushNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        {
          title: "🪑 Nueva reserva",
          body: `${customerName} — ${partySize} personas el ${date} a las ${time}`,
          url: "/admin",
        }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
