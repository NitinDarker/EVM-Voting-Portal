import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query<any[]>(`
      SELECT e.election_id, e.e_name, e.start_time, e.end_time,
        (SELECT COUNT(*) FROM anonymous_vote av WHERE av.election_id=e.election_id) AS total_votes,
        c.c_name AS winner_name,
        p.p_name AS party_name
      FROM election e
      LEFT JOIN (
        SELECT election_id,candidate_id,COUNT(*) AS vote_count
        FROM anonymous_vote GROUP BY election_id,candidate_id
      ) w ON w.election_id=e.election_id
      LEFT JOIN candidate c ON c.candidate_id=w.candidate_id
      LEFT JOIN party p ON p.party_id=c.party_id
      WHERE e.end_time < CURRENT_DATE
      ORDER BY e.end_time DESC;
    `);

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
