import { NextResponse } from "next/server";
import { ensureAdminRequest } from "@/lib/admin-route-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { sendPushNotification } from "@/lib/web-push";

export async function PATCH(req: Request) {
  const authErr = ensureAdminRequest(req);
  if (authErr) return authErr;

  try {
    const { id, status } = await req.json();
    const valid = ["pending", "approved", "rejected", "cancelled"];
    if (!id || !valid.includes(status)) {
      return NextResponse.json({ ok: false, message: "Datos inválidos" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Obtener la reserva para saber el user_id
    const { data: reservation, error: fetchErr } = await supabase
      .from("reservations")
      .select("user_id, customer_name")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    // Enviar push al usuario si tiene suscripción
    if (!fetchErr && reservation?.user_id && ["approved", "rejected"].includes(status)) {
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("user_id", reservation.user_id)
        .eq("is_admin", false);

      const label = status === "approved" ? "✅ Reserva confirmada" : "❌ Reserva rechazada";
      const body = status === "approved"
        ? `Tu reserva ha sido confirmada. ¡Te esperamos!`
        : `Tu reserva no pudo ser confirmada.`;

      for (const sub of subs ?? []) {
        await sendPushNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          { title: label, body, url: "/reservas" }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
