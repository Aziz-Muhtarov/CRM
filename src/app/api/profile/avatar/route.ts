// src/app/api/profile/avatar/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cloudinary } from "@/server/cloudinary";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const contentType = file.type || "";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult: UploadApiResponse = (await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "avatars",
          public_id: `user_${userId}`,
          overwrite: true,
          resource_type: "image",
          transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("No upload result"));
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    })) as UploadApiResponse;

    const imageUrl = uploadResult.secure_url as string;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: imageUrl },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}