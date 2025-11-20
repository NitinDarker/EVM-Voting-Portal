export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = (await db.query(
      `SELECT party_id, p_name, p_symbol FROM party`
    )) as unknown as [any[]];

    return NextResponse.json({ parties: rows });
  } catch (err) {
    console.error("LIST PARTIES ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
