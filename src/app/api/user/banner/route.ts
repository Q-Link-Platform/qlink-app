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
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to parse form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Banner file size must be less than 10MB" }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mime = file.type || "image/jpeg";
    const ext = file.name.split('.').pop()?.toLowerCase() || "jpg";
    const timestamp = Date.now();
    const filename = `banner-${userId}-${timestamp}.${ext}`;

    let url: string | null = null;

    // 1. Try Supabase storage if available
    const supabase = supabasePostsAdmin || supabasePosts;
    if (supabase) {
      try {
        const uploadRes = await supabase.storage
          .from("banners")
          .upload(filename, buffer, {
            cacheControl: "31536000",
            upsert: true,
            contentType: mime,
          });
        if (!uploadRes.error) {
          const pub = supabase.storage.from("banners").getPublicUrl(filename);
          if (pub?.data?.publicUrl) {
            url = pub.data.publicUrl;
          }
        }
      } catch (err) {
        console.warn("[banner-upload] Supabase upload failed, falling back:", err);
      }
    }

    // 2. Try local filesystem if writable (localhost development)
    if (!url) {
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "banners");
        await mkdir(uploadsDir, { recursive: true });
        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);
        url = `/uploads/banners/${filename}`;
      } catch (fsErr) {
        console.warn("[banner-upload] Local disk write unavailable (serverless environment), routing to database vault");
      }
    }

    // 3. Resilient Database Vault fallback (works 100% on Vercel and serverless)
    if (!url) {
      url = `data:${mime};base64,${buffer.toString("base64")}`;
    }

    // Update user's banner URL in database
    await prisma.user.update({
      where: { id: userId },
      data: { banner: url },
    });

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error("[banner-upload] Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to upload banner image" }, { status: 500 });
  }
}
