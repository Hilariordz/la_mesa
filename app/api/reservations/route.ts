import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer_name, customer_phone, party_size, date, time, notes } = body;

    if (!customer_name || !date || !time || !party_size) {
      return NextResponse.json({ ok: false, message: "Datos incompletos" }, { status: 400 });
    }

    // Try to get user_id if logged in
    let userId: string | null = null;
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
      userId = data.user?.id ?? null;
    } catch { /* guest */ }

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
