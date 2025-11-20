export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import redis from "@/lib/redis";
import { resend } from "@/lib/resend";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, region_id } = await req.json();

    if (!name || !email || !password || !region_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

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

    const otp = crypto.randomInt(100000, 999999).toString();
    const otp_hash = await bcrypt.hash(otp, 10);
    const hashed_password = await bcrypt.hash(password, 10);

    await redis.set(
      `otp:${email}`,
      JSON.stringify({
        name,
        hashed_password,
        region_id,
        otp_hash,
      }),
      "EX",
      600
    );

    await resend.emails.send({
      from: "EVM Portal <onboarding@resend.dev>",
      to: email,
      subject: "Your OTP for Registration",
      text: `Your OTP is ${otp}`,
    });

    return NextResponse.json({ success: true, message: "OTP sent." });
  } catch (err: any) {
    console.error("SEND OTP ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
