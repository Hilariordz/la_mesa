import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
    );
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch { return null; }
}

const ONE_HOUR = 60 * 60 * 1000;

async function getReservation(id: string, userId: string) {
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("reservations")
    .select("id, user_id, created_at, status")
    .eq("id", id)
    .single();
  if (!data || data.user_id !== userId) return null;
  return data;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });

  const reservation = await getReservation(id, userId);
  if (!reservation) return NextResponse.json({ ok: false, message: "No encontrada" }, { status: 404 });

  if (Date.now() - new Date(reservation.created_at).getTime() > ONE_HOUR)
    return NextResponse.json({ ok: false, message: "El tiempo para editar ha expirado" }, { status: 403 });

  const { date, time, party_size, notes } = await req.json();
  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from("reservations")
    .update({ date, time, party_size, notes })
    .eq("id", id);

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });

  const reservation = await getReservation(id, userId);
  if (!reservation) return NextResponse.json({ ok: false, message: "No encontrada" }, { status: 404 });

  if (Date.now() - new Date(reservation.created_at).getTime() > ONE_HOUR)
    return NextResponse.json({ ok: false, message: "El tiempo para cancelar ha expirado" }, { status: 403 });

  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
