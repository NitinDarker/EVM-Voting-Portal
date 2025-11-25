export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken } from "@/lib/adminAuth";

interface CandidateInput {
  c_name: string;
  party_id: number;
}

export async function POST(req: NextRequest) {
  try {
    const { c_name, party_id }: CandidateInput = await req.json();

    if (!c_name || !party_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Admin validation
    const adminToken = req.cookies.get("admin_session")?.value;
    const admin = adminToken ? verifyAdminToken(adminToken) : null;

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized admin" },
        { status: 401 }
      );
    }

    // Validate party exists
    const [partyRows] = (await db.query(
      `SELECT party_id FROM party WHERE party_id = ?`,
      [party_id]
    )) as unknown as [{ party_id: number }[]];

    if (partyRows.length === 0) {
      return NextResponse.json(
        { error: "Party does not exist" },
        { status: 400 }
      );
    }

    // Insert candidate
    const [result] = await db.query(
      `
      INSERT INTO candidate (c_name, party_id)
      VALUES (?, ?)
      `,
      [c_name, party_id]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Candidate created",
        candidate_id: (result as any).insertId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("CREATE CANDIDATE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
