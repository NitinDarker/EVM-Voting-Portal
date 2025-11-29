import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyVoterToken } from "@/lib/voterAuth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value as string;
    const id = verifyVoterToken(token)?.voter_id;
    const [[stats]] = await db.query<any[]>(
      `
      SELECT
        (SELECT COUNT(*) FROM voting_status WHERE voter_id=? AND has_voted=1) AS participated,
        (SELECT COUNT(*) FROM election WHERE CURRENT_DATE BETWEEN start_time AND end_time) AS active,
        (SELECT COUNT(*) FROM election) AS total
      `,
      [id]
    );

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
