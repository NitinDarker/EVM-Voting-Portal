import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const protectedRoutes = [
    "/api/vote",
    "/api/election",
    "/api/candidate",
    "/api/protected",
  ];

  const { pathname } = req.nextUrl;

  // If this route doesn't need protection, skip
  if (!protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = verifyToken(token);

  if (!user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  // Allow request
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
