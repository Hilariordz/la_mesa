import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSessionToken } from "@/lib/admin-auth";

function getCookieFromHeader(cookieHeader: string | null, cookieName: string) {
  if (!cookieHeader) {
    return null;
  }

  const parts = cookieHeader.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${cookieName}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

export function ensureAdminRequest(req: Request) {
  const expectedToken = getAdminSessionToken();
  const cookieHeader = req.headers.get("cookie");
  const sessionCookie = getCookieFromHeader(cookieHeader, ADMIN_SESSION_COOKIE);

  if (!expectedToken || sessionCookie !== expectedToken) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  return null;
}
