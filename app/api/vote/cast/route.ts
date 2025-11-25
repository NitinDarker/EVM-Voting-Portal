export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyVoterToken } from "@/lib/voterAuth";

interface Input {
  election_id: number;
  candidate_id: number;
}

export async function POST(req: NextRequest) {
  const connection = await db.getConnection();

  try {
    const { election_id, candidate_id }: Input = await req.json();
    const token = req.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized voter" },
        { status: 401 }
      );
    }

    const voter = verifyVoterToken(token);
    if (!voter) {
      return NextResponse.json(
        { error: "Invalid voter session" },
        { status: 401 }
      );
    }

    const voter_id = voter.voter_id;

    if (!election_id || !candidate_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // START TRANSACTION
    await connection.beginTransaction();

    // 1. Validate election (lock row)
    const [election] = (await connection.query(
      `
      SELECT start_time, end_time 
      FROM election 
      WHERE election_id = ?
      FOR UPDATE
      `,
      [election_id]
    )) as unknown as [any[]];

    if (election.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    if (now < election[0].start_time || now > election[0].end_time) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Election is not active" },
        { status: 400 }
      );
    }

    // 2. Validate candidate participates in the election
    const [participant] = (await connection.query(
      `
      SELECT * FROM participant
      WHERE candidate_id = ? AND election_id = ?
      FOR UPDATE
      `,
      [candidate_id, election_id]
    )) as unknown as [any[]];

    if (participant.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Candidate is not part of this election" },
        { status: 400 }
      );
    }

    // 3. Check if voter already voted (ROW-LEVEL LOCK)
    const [voteStatus] = (await connection.query(
      `
      SELECT has_voted 
      FROM voting_status
      WHERE voter_id = ? AND election_id = ?
      FOR UPDATE
      `,
      [voter_id, election_id]
    )) as unknown as [any[]];

    if (voteStatus.length > 0 && voteStatus[0].has_voted === 1) {
      await connection.rollback();
      return NextResponse.json({ error: "Already voted" }, { status: 400 });
    }

    // 4. Insert anonymous vote
    await connection.query(
      `
      INSERT INTO anonymous_vote (election_id, candidate_id)
      VALUES (?, ?)
      `,
      [election_id, candidate_id]
    );

    // 5. Update voting_status
    if (voteStatus.length === 0) {
      await connection.query(
        `
        INSERT INTO voting_status (voter_id, election_id, has_voted)
        VALUES (?, ?, 1)
        `,
        [voter_id, election_id]
      );
    } else {
      await connection.query(
        `
        UPDATE voting_status 
        SET has_voted = 1
        WHERE voter_id = ? AND election_id = ?
        `,
        [voter_id, election_id]
      );
    }

    // COMMIT TRANSACTION
    await connection.commit();

    return NextResponse.json(
      { success: true, message: "Vote recorded successfully" },
      { status: 201 }
    );
  } catch (err) {
    console.error("VOTING ERROR:", err);
    await connection.rollback();
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    connection.release();
  }
}
