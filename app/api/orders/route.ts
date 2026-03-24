import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

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
