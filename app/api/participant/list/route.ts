export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const election_id = searchParams.get("election_id");

    if (!election_id) {
      return NextResponse.json(
        { error: "Election ID required" },
        { status: 400 }
      );
    }

    // You need to JOIN participant -> candidate -> party to get the full details
    // I am assuming your party table has p_name and p_symbol.
    const query = `
      SELECT 
        c.candidate_id, 
        c.c_name as candidate_name, 
        p.p_name as party_name, 
        p.p_symbol as party_symbol
      FROM participant part
      JOIN candidate c ON part.candidate_id = c.candidate_id
      JOIN party p ON c.party_id = p.party_id
      WHERE part.election_id = ?
    `;

    const [candidates]: any = await db.query(query, [election_id]);

    return NextResponse.json({ candidates });
  } catch (err) {
    console.error("FETCH CANDIDATES ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
