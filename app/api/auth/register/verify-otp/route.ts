export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

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

    await db.query(
      `INSERT INTO Voter (v_name, v_email, v_password, region_id)
       VALUES (?, ?, ?, ?)`,
      [parsed.name, email, parsed.hashed_password, parsed.region_id]
    );

    await redis.del(`otp:${email}`);

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
    });
  } catch (err: any) {
    console.error("VERIFY OTP ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
