import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionToken,
} from "@/lib/admin-auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const expectedToken = getAdminSessionToken();
  const sessionCookie = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (pathname === "/admin") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!expectedToken || sessionCookie !== expectedToken) {
      const loginUrl = new URL("/admin", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (
    pathname.startsWith("/api/admin") &&
    pathname !== "/api/admin/login" &&
    pathname !== "/api/admin/logout"
  ) {
    if (!expectedToken || sessionCookie !== expectedToken) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
