export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const COOKIE_EXPIRE_DAYS = 7;

interface AdminRow {
  admin_id: number;
  a_name: string;
  a_email: string;
  a_password: string;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    const [rows] = (await db.query(
      "SELECT admin_id, a_name, a_email, a_password FROM admin WHERE a_email = ?",
      [email]
    )) as unknown as [AdminRow[]];

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const admin = rows[0];

    const match = await bcrypt.compare(password, admin.a_password);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        admin_id: admin.admin_id,
        name: admin.a_name,
        isAdmin: true,
      },
      process.env.ADMIN_JWT_SECRET!,
      { expiresIn: `${COOKIE_EXPIRE_DAYS}d` }
    );

    const res = NextResponse.json({ success: true });

    res.cookies.set({
      name: "admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_EXPIRE_DAYS * 24 * 60 * 60,
      sameSite: "lax",
    });

    return res;
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
