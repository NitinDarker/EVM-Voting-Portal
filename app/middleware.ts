import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { verifyAdminToken } from "@/lib/adminAuth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // VOTER PROTECTED ROUTES
  if (pathname.startsWith("/api/voter") || pathname.startsWith("/api/vote")) {
    const token = req.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    return NextResponse.next();
  }

  // ADMIN PROTECTED ROUTES
  if (
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/election") ||
    pathname.startsWith("/api/candidate")
  ) {
    const adminToken = req.cookies.get("admin_session")?.value;

    if (!adminToken) {
      return NextResponse.json(
        { error: "Admin Unauthorized" },
        { status: 401 }
      );
    }

    const admin = verifyAdminToken(adminToken);
    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { error: "Invalid admin session" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // Default allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
