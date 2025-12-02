export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_session")?.value as string;
    const admin = verifyAdminToken(token);
    const admin_id = admin?.admin_id;

    const [elections]: any = await db.query(
      `SELECT * FROM election WHERE admin_id=? AND end_time < NOW() ORDER BY end_time DESC`,
      [admin_id]
    );

    const electionsWithWinners = await Promise.all(
      elections.map(async (election: any) => {
        const [results]: any = await db.query(
          `SELECT 
             c.candidate_id, 
             c.c_name as candidate_name, 
             p.p_name as party_name, 
             COUNT(av.vote_id) as vote_count
           FROM participant part
           JOIN candidate c ON part.candidate_id = c.candidate_id
           JOIN party p ON c.party_id = p.party_id
           LEFT JOIN anonymous_vote av 
             ON av.candidate_id = c.candidate_id 
             AND av.election_id = part.election_id
           WHERE part.election_id = ?
           GROUP BY c.candidate_id
           ORDER BY vote_count DESC
           LIMIT 1`,
          [election.election_id]
        );

        const [total]: any = await db.query(
          `SELECT COUNT(*) as count FROM anonymous_vote WHERE election_id = ?`,
          [election.election_id]
        );

        return {
          ...election,
          total_votes: total[0].count,
          winner:
            results.length > 0 && results[0].vote_count > 0
              ? {
                  candidate_id: results[0].candidate_id,
                  candidate_name: results[0].candidate_name,
                  party_name: results[0].party_name,
                  vote_count: results[0].vote_count,
                }
              : null,
        };
      })
    );

    return NextResponse.json({ elections: electionsWithWinners });
  } catch (err) {
    console.error("FETCH PAST ELECTIONS ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
