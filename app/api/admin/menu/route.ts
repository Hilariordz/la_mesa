import { NextResponse } from "next/server";
import { ensureAdminRequest } from "@/lib/admin-route-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const authErr = ensureAdminRequest(req);
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const { name, description, price, image_url, category_id, available } = body;
    if (!name || !price || !category_id) {
      return NextResponse.json({ ok: false, message: "Datos incompletos" }, { status: 400 });
    }
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("menu_items")
      .insert({ name, description, price, image_url, category_id, available: available ?? true });
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const authErr = ensureAdminRequest(req);
  if (authErr) return authErr;

  try {
    const { id, ...fields } = await req.json();
    if (!id) return NextResponse.json({ ok: false, message: "ID requerido" }, { status: 400 });

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("menu_items").update(fields).eq("id", id);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authErr = ensureAdminRequest(req);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, message: "ID requerido" }, { status: 400 });

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
