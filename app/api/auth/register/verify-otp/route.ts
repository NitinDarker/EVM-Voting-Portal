export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Cookie expires in 7 days
const COOKIE_EXPIRE_DAYS = 7;

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP required" },
        { status: 400 }
      );
    }

    const data = await redis.get(`otp:${email}`);
    if (!data) {
      return NextResponse.json(
        { error: "OTP expired or not found" },
        { status: 410 }
      );
    }

    const parsed = JSON.parse(data);

    const validOtp = await bcrypt.compare(otp, parsed.otp_hash);
    if (!validOtp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    }

    // Insert new voter
    const [result]: any = await db.query(
      `INSERT INTO voter (v_name, v_email, v_password, region_id)
       VALUES (?, ?, ?, ?)`,
      [parsed.name, email, parsed.hashed_password, parsed.region_id]
    );

    const voter_id = result.insertId;

    // Delete OTP from Redis
    await redis.del(`otp:${email}`);

    // Create JWT token and set session cookie
    const token = jwt.sign(
      {
        voter_id: voter_id,
        region_id: parsed.region_id,
        name: parsed.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: `${COOKIE_EXPIRE_DAYS}d` }
    );

    // Set secure cookie
    const res = NextResponse.json({
      success: true,
      message: "Account created successfully",
    });

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
  } catch (err: any) {
    console.error("VERIFY OTP ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
