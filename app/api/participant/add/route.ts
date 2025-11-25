export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken } from "@/lib/adminAuth";

interface Input {
  candidate_id: number;
  election_id: number;
}``

export async function POST(req: NextRequest) {
  const connection = await db.getConnection(); // needed for transactions

  try {
    const { candidate_id, election_id }: Input = await req.json();

    if (!candidate_id || !election_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify admin
    const token = req.cookies.get("admin_session")?.value;
    const admin = token ? verifyAdminToken(token) : null;

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized admin" },
        { status: 401 }
      );
    }

    // Begin transaction
    await connection.beginTransaction();

    // Validate candidate exists
    const [candidate] = (await connection.query(
      `SELECT candidate_id FROM candidate WHERE candidate_id = ? FOR UPDATE`,
      [candidate_id]
    )) as unknown as [any[]]; 

    if (candidate.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 400 }
      );
    }

    // Validate election exists
    const [election] = (await connection.query(
      `SELECT election_id FROM election WHERE election_id = ? FOR UPDATE`,
      [election_id]
    )) as unknown as [any[]];

    if (election.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Election not found" },
        { status: 400 }
      );
    }

    // Check if candidate is already in this election
    const [exists] = (await connection.query(
      `
      SELECT * FROM participant 
      WHERE candidate_id = ? AND election_id = ?
      FOR UPDATE
      `,
      [candidate_id, election_id]
    )) as unknown as [any[]];

    if (exists.length > 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Candidate already participating in this election" },
        { status: 409 }
      );
    }

    // Insert new participant entry
    await connection.query(
      `
      INSERT INTO participant (candidate_id, election_id)
      VALUES (?, ?)
      `,
      [candidate_id, election_id]
    );

    await connection.commit();

    return NextResponse.json(
      { success: true, message: "Candidate added to election" },
      { status: 201 }
    );
  } catch (err) {
    console.error("ADD PARTICIPANT ERROR:", err);
    await connection.rollback();
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    connection.release();
  }
}
