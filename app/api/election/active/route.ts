import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [data] = await db.query<any[]>(`
      SELECT e.election_id, e.e_name, e.start_time, e.end_time,
        (SELECT COUNT(*) FROM participant p WHERE p.election_id=e.election_id) AS candidate_count
      FROM election e
      WHERE CURRENT_DATE BETWEEN e.start_time AND e.end_time;
    `);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
