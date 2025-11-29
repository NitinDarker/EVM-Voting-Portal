import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyVoterToken } from "@/lib/voterAuth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('session')?.value as string;
    const user = verifyVoterToken(token);
    const id = user?.voter_id;

    const [rows] = await db.query<any[]>(
      `SELECT v.voter_id, v.v_name, v.v_email, r.r_name 
       FROM voter v JOIN region r ON v.region_id = r.region_id 
       WHERE v.voter_id = ? LIMIT 1`,
      [id]
    );
    return NextResponse.json(rows[0] ?? null);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
