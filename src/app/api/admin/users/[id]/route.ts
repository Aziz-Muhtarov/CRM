// src/app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const id = Number(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("GET /api/admin/users/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const id = Number(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await req.json();
    const { role, name, password } = body as { role?: string; name?: string; password?: string };

    const data: any = {};
    if (typeof name === "string" && name.trim().length) data.name = name.trim();
    if (typeof role === "string" && role.trim()) data.role = role.trim();
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
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const id = Number(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const currentUserId = Number(session.user.id);
    if (currentUserId === id) {
      return NextResponse.json({ error: "You can't delete your own account" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}