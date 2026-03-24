import { NextResponse } from "next/server";
import { ensureAdminRequest } from "@/lib/admin-route-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const authErr = ensureAdminRequest(req);
  if (authErr) return authErr;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data: data ?? [] });
}

export async function POST(req: Request) {
  const authErr = ensureAdminRequest(req);
  if (authErr) return authErr;

  try {
    const { name, emoji, sort_order } = await req.json();
    if (!name) return NextResponse.json({ ok: false, message: "Nombre requerido" }, { status: 400 });

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("categories")
      .insert({ name, emoji: emoji || "🍽️", sort_order: sort_order ?? 0, active: true });

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
    const { error } = await supabase.from("categories").update(fields).eq("id", id);
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
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
