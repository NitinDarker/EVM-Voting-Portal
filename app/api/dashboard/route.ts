import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface VoterRow {
  voter_id: number;
  v_name: string;
  v_email: string;
  region_name: string;
}

interface ActiveElection {
  election_id: number;
  election_name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  region_name: string;
  candidate_count: number;
  total_votes: number;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "email query param is required" },
        { status: 400 }
      );
    }

    const [voterRows] = await db.query<any[]>(
      `
      SELECT 
        v.voter_id,
        v.v_name,
        v.v_email,
        r.r_name
      FROM voter v
      JOIN region r ON v.region_id = r.region_id
      WHERE v.v_email = ?
      LIMIT 1;
      `,
      [email]
    );

    const voterRow = voterRows[0] ?? null;

    const voter = voterRow
      ? {
          voter_id: voterRow.voter_id,
          name: voterRow.v_name,
          email: voterRow.v_email,
          region_name: voterRow.r_name,
        }
      : null;

    const [activeElections] = await db.query<any[]>(
      `
      SELECT 
        e.election_id,
        e.e_name AS election_name,
        NULL AS description,                           
        e.start_time AS start_date,
        e.end_time AS end_date,
        r.r_name AS region_name,
        (SELECT COUNT(*) FROM participant p WHERE p.election_id = e.election_id) AS candidate_count,
        (SELECT COUNT(*) FROM voting_status vs WHERE vs.election_id = e.election_id) AS total_votes
      FROM election e
      JOIN region r ON r.region_id = e.region_id
      WHERE e.start_time <= CURRENT_DATE
        AND e.end_time >= CURRENT_DATE;                
      `
    );

    const [pastElections] = await db.query<any[]>(`
      SELECT 
        e.election_id,
        e.e_name AS election_name,
        e.start_time AS start_date,
        e.end_time AS end_date,
        (
          (SELECT COUNT(*) FROM anonymous_vote av WHERE av.election_id = e.election_id) +
          (SELECT COUNT(*) FROM voting_status vs WHERE vs.election_id = e.election_id AND vs.has_voted = 1)
        ) AS total_votes,

        c.c_name AS winner_name,
        p.p_name AS party_name,
        win.vote_count AS vote_count

      FROM election e
      LEFT JOIN (
        SELECT 
          av.election_id,
          av.candidate_id,
          COUNT(av.candidate_id) AS vote_count
        FROM anonymous_vote av
        GROUP BY av.election_id, av.candidate_id
      ) AS win ON win.election_id = e.election_id
      LEFT JOIN candidate c ON c.candidate_id = win.candidate_id
      LEFT JOIN party p ON p.party_id = c.party_id
      WHERE e.end_time < CURRENT_DATE()
      ORDER BY e.end_time DESC
    `);

    const [stats] = await db.query<any[]>(
      `
      SELECT 
        -- elections voter voted in
        (SELECT COUNT(*) FROM voting_status WHERE voter_id = ? AND has_voted = 1) AS elections_participated,

        -- currently active
        (SELECT COUNT(*) FROM election WHERE CURRENT_DATE() BETWEEN start_time AND end_time) AS active_elections,

        -- total elections in system
        (SELECT COUNT(*) FROM election) AS total_elections
    `,
      [voter?.voter_id]
    );

    return NextResponse.json({
      voter,
      activeElections,
      pastElections,
      userStats: stats[0],
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return NextResponse.json({ error: "DB fetch failed" }, { status: 500 });
  }
}
