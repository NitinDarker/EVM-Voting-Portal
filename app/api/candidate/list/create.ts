export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = (await db.query(
      `
      SELECT
        c.candidate_id,
        c.c_name,
        p.p_name AS party_name,
        p.p_symbol AS party_symbol
      FROM candidate c
      JOIN party p ON c.party_id = p.party_id;
      `
    )) as unknown as [any[]];

    return NextResponse.json({ candidates: rows });
  } catch (err) {
    console.error("LIST CANDIDATES ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
