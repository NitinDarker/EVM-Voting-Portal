import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_session")?.value as string;
    const admin = verifyAdminToken(token);
    const admin_id = admin?.admin_id;

    const [data] = await db.query<any[]>(
      `
      SELECT e.election_id, e.e_name, e.start_time, e.end_time,
        (SELECT COUNT(*) FROM participant p WHERE p.election_id=e.election_id) AS candidate_count
      FROM election e
      WHERE CURRENT_DATE BETWEEN e.start_time AND e.end_time 
        AND e.admin_id=?;
    `,
      [admin_id]
    );

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
