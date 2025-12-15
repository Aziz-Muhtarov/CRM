// src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    if (Number.isNaN(userId)) return NextResponse.json({ error: "Invalid user id" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    if (Number.isNaN(userId)) return NextResponse.json({ error: "Invalid user id" }, { status: 400 });

    const body = await req.json();
    const { name, password } = body as { name?: string; password?: string };

    const data: any = {};
    if (typeof name === "string" && name.trim().length) data.name = name.trim();

    if (typeof password === "string" && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }
      data.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("PATCH /api/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
