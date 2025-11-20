export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

interface AdminInput {
  name: string;
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password }: AdminInput = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if admin email already exists
    const [existing] = (await db.query(
      "SELECT admin_id FROM admin WHERE a_email = ?",
      [email]
    )) as unknown as [{ admin_id: number }[]];

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      `
      INSERT INTO admin (a_name, a_email, a_password)
      VALUES (?, ?, ?)
      `,
      [name, email, hashed]
    );

    return NextResponse.json(
      { success: true, message: "Admin account created" },
      { status: 201 }
    );
  } catch (err) {
    console.error("ADMIN SIGNUP ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
