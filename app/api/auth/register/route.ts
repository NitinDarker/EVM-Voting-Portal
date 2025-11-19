import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, region_id } = body;

    if (!name || !email || !password || !region_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existing] = await db.query(
      "SELECT voter_id FROM Voter WHERE v_email = ?",
      [email]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO Voter (v_name, v_email, v_password, region_id)
       VALUES (?, ?, ?, ?)`,
      [name, email, hashed, region_id]
    );

    return NextResponse.json(
      { success: true, message: "Voter registered successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
