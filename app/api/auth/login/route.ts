export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Cookie expires in 7 days
const COOKIE_EXPIRE_DAYS = 7;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      "SELECT voter_id, v_password, region_id, v_name FROM Voter WHERE v_email = ?",
      [email]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const voter = (rows as any)[0];

    // Compare password
    const match = await bcrypt.compare(password, voter.v_password);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Build JWT payload
    const token = jwt.sign(
      {
        voter_id: voter.voter_id,
        region_id: voter.region_id,
        name: voter.v_name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: `${COOKIE_EXPIRE_DAYS}d` }
    );

    // Set secure cookie
    const res = NextResponse.json({ success: true });

    res.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_EXPIRE_DAYS * 24 * 60 * 60,
      sameSite: "lax",
    });

    return res;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
