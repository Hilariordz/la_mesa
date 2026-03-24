import { NextResponse } from "next/server";
import { ensureAdminRequest } from "@/lib/admin-route-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const authErr = ensureAdminRequest(req);
  if (authErr) return authErr;

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? "pending";

    const validStatuses = ["pending", "approved", "rejected", "cancelled", "all"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { ok: false, message: "Filtro de estado inválido" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    let query = supabase
      .from("reservations")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Error interno" },
      { status: 500 }
    );
  }
}
