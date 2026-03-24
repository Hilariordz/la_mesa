import { NextResponse } from "next/server";
import { ensureAdminRequest } from "@/lib/admin-route-auth";

export async function GET(req: Request) {
  const err = ensureAdminRequest(req);
  if (err) return err;
  return NextResponse.json({ ok: true });
}
