export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function PUT(req: NextRequest) {
  try {
    const { election_id } = await req.json();
    const adminToken = req.cookies.get("admin_session")?.value as string; 

    if (!verifyAdminToken(adminToken)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // UPDATE the end_time to NOW()
    await db.query(
      `UPDATE election SET end_time = NOW() WHERE election_id = ?`,
      [election_id]
    );

    return NextResponse.json({ success: true, message: "Election stopped" });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
