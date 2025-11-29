export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken } from "@/lib/adminAuth";

interface ElectionInput {
  e_name: string;
  start_time: string;
  end_time: string;
  region_id: number;
}

export async function POST(req: NextRequest) {
  try {
    const { e_name, start_time, end_time, region_id }: ElectionInput =
      await req.json();

    if (!e_name || !start_time || !end_time || !region_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate date format
    const start = new Date(start_time);
    const end = new Date(end_time);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: "start_time must be before end_time" },
        { status: 400 }
      );
    }

    // Extract admin session (JWT cookie)
    const adminToken = req.cookies.get("admin_session")?.value;

    if (!adminToken) {
      return NextResponse.json(
        { error: "Admin unauthorized" },
        { status: 401 }
      );
    }

    const admin = verifyAdminToken(adminToken);

    if (!admin || !admin.admin_id) {
      return NextResponse.json(
        { error: "Invalid admin session" },
        { status: 403 }
      );
    }

    // Insert into DB and capture the result
    // Using 'any' for the result tuple to safely access insertId without strict typing headaches
    const [result]: any = await db.query(
      `
      INSERT INTO election (e_name, start_time, end_time, region_id, admin_id)
      VALUES (?, ?, ?, ?, ?)
      `,
      [e_name, start, end, region_id, admin.admin_id]
    );

    // Return success with the new election_id
    return NextResponse.json(
      {
        success: true,
        message: "Election created successfully",
        election_id: result.insertId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("CREATE ELECTION ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
