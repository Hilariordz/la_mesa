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

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("id, status, customer_name, table_number, total, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data: data ?? [] });
}

export async function POST(req: Request) {
  try {
    const { table_number, customer_name, notes, items } = await req.json();

    if (!customer_name || !items?.length) {
      return NextResponse.json({ ok: false, message: "Datos incompletos" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const total = items.reduce(
      (s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity,
      0
    );

    const { data: order, error } = await supabase
      .from("orders")
      .insert({ table_number, customer_name, notes, total, status: "pending" })
      .select("id")
      .single();

    if (error || !order) {
      return NextResponse.json({ ok: false, message: error?.message ?? "Error" }, { status: 500 });
    }

    await supabase.from("order_items").insert(
      items.map((i: { menu_item_id: string; name: string; price: number; quantity: number }) => ({
        order_id: order.id,
        menu_item_id: i.menu_item_id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }))
    );

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch {
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
