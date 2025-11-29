export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  // 👇 CHANGE 1: params is a Promise now
  { params }: { params: Promise<{ election_id: string }> }
) {
  try {
    // 👇 CHANGE 2: You must await params
    const { election_id: idSlug } = await params;
    const election_id = Number(idSlug);

    if (isNaN(election_id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const demo = req.nextUrl.searchParams.get("demo") === "1";

    // ... The rest of your code remains exactly the same ...

    // Get election meta
    const [election] = (await db.query(
      `SELECT e_name, end_time FROM election WHERE election_id = ?`,
      [election_id]
    )) as unknown as [{ e_name: string; end_time: string }[]];

    if (election.length === 0) {
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 }
      );
    }

    const today = new Date();
    const end = new Date(election[0].end_time);

    if (!demo && today <= end) {
      return NextResponse.json(
        { error: "Results will be available only after election ends." },
        { status: 403 }
      );
    }

    const [results] = (await db.query(
      `
      SELECT 
        c.candidate_id,
        c.c_name,
        COUNT(av.vote_id) AS total_votes
      FROM participant p
      JOIN candidate c ON p.candidate_id = c.candidate_id
      LEFT JOIN anonymous_vote av 
          ON av.candidate_id = c.candidate_id 
          AND av.election_id = p.election_id
      WHERE p.election_id = ?
      GROUP BY c.candidate_id, c.c_name
      ORDER BY total_votes DESC;
      `,
      [election_id]
    )) as unknown as [any[]];

    const total = results.reduce((sum, r) => sum + r.total_votes, 0);

    return NextResponse.json({
      election_name: election[0].e_name,
      results_released: demo || today > end,
      total_votes_cast: total,
      results,
    });
  } catch (err) {
    console.error("RESULT ROUTE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
