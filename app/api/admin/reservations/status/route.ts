import { NextResponse } from "next/server";
import { ensureAdminRequest } from "@/lib/admin-route-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

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
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
