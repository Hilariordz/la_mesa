import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getAdminPasscode,
  getAdminSessionToken,
} from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { passcode } = (await req.json()) as { passcode?: string };

  const expectedPasscode = getAdminPasscode();
  const sessionToken = getAdminSessionToken();

  if (!expectedPasscode || !sessionToken) {
    return NextResponse.json(
      { ok: false, message: "Admin auth is not configured" },
      { status: 500 }
    );
  }

  if (!passcode || passcode !== expectedPasscode) {
    return NextResponse.json(
      { ok: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return res;
}
