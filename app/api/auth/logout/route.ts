import { NextResponse } from "next/server"

export async function GET() {
  const res = NextResponse.json({ message: "Logged out" })
  res.cookies.set("session", "", { maxAge: 0, path: "/" })
  return res
}
