export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken } from "@/lib/adminAuth";

interface PartyInput {
  p_name: string;
  p_symbol?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { p_name, p_symbol }: PartyInput = await req.json();

    if (!p_name) {
      return NextResponse.json(
        { error: "Party name required" },
        { status: 400 }
      );
    }

    // Validate admin
    const adminToken = req.cookies.get("admin_session")?.value;
    const admin = adminToken ? verifyAdminToken(adminToken) : null;

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized admin" },
        { status: 401 }
      );
    }

    await db.query(
      `
      INSERT INTO party (p_name, p_symbol)
      VALUES (?, ?)
      `,
      [p_name, p_symbol ?? null]
    );

    return NextResponse.json(
      { success: true, message: "Party created" },
      { status: 201 }
    );
  } catch (err) {
    console.error("CREATE PARTY ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
