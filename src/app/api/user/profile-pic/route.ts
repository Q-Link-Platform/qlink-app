import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { supabasePosts, supabasePostsAdmin } from "@/lib/supabasePosts";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as any).id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "User id missing in session" }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Failed to parse form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File size must be less than 8MB" }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mime = file.type || "image/jpeg";
    const ext = file.name.split('.').pop()?.toLowerCase() || "jpg";
    const timestamp = Date.now();
    const filename = `avatar-${userId}-${timestamp}.${ext}`;

    let url: string | null = null;

    // 1. Try Supabase storage if available
    const supabase = supabasePostsAdmin || supabasePosts;
    if (supabase) {
      try {
        const uploadRes = await supabase.storage
          .from("profile-photos")
          .upload(filename, buffer, {
            cacheControl: "31536000",
            upsert: true,
            contentType: mime,
          });
        if (!uploadRes.error) {
          const pub = supabase.storage.from("profile-photos").getPublicUrl(filename);
          if (pub?.data?.publicUrl) {
            url = pub.data.publicUrl;
          }
        }
      } catch (err) {
        console.warn("[profile-pic] Supabase upload note:", err);
      }
    }

    // 2. Try local filesystem if writable (localhost dev)
    if (!url) {
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "profile-pics");
        await mkdir(uploadsDir, { recursive: true });
        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);
        url = `/uploads/profile-pics/${filename}`;
      } catch (fsErr) {
        console.warn("[profile-pic] Local disk write unavailable, routing to database vault");
      }
    }

    // 3. Resilient Database Vault fallback (works 100% on Vercel and serverless)
    if (!url) {
      url = `data:${mime};base64,${buffer.toString("base64")}`;
    }

    // Update user's profile photo URL in database
    await prisma.user.update({
      where: { id: userId },
      data: { image: url }
    });

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error("Profile picture upload error:", error);
    return NextResponse.json({ error: error?.message || "Failed to upload image" }, { status: 500 });
  }
}
