import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_session')?.value as string;
    const user = verifyAdminToken(token);
    const id = user?.admin_id;

    const [rows] = await db.query<any[]>(
      `SELECT admin_id, a_name, a_email 
       FROM admin 
       WHERE admin_id = ? LIMIT 1`,
      [id]
    );
    return NextResponse.json(rows[0] ?? null);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
