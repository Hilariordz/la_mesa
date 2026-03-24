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
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    );
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer_name, customer_phone, party_size, date, time, notes } = body;

    if (!customer_name || !date || !time || !party_size) {
      return NextResponse.json({ ok: false, message: "Datos incompletos" }, { status: 400 });
    }

    const userId = await getUserId();

    const admin = getSupabaseAdminClient();
    const { data, error } = await admin
      .from("reservations")
      .insert({ customer_name, customer_phone, party_size, date, time, notes, user_id: userId, status: "pending" })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, message: error?.message ?? "Error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reservationId: data.id });
  } catch {
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("reservations")
    .select("id, customer_name, party_size, date, time, status, notes")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("time", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: data ?? [] });
}
