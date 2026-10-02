import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET current authenticated user profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as any).id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "User id missing in session" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        handle: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        banner: true,
        location: true,
        website: true,
        blue_tick_status: true,
        aura_percentage: true,
        points: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error("[profile-api] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// Update comprehensive profile fields (X / Twitter standard)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as any).id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "User id missing in session" }, { status: 400 });
  }

  let body: {
    name?: string | null;
    bio?: string | null;
    location?: string | null;
    website?: string | null;
    banner?: string | null;
    image?: string | null;
    handle?: string | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const updates: Record<string, any> = {};

  // 1. Name
  if (typeof body.name === "string") {
    const trimmed = body.name.trim();
    updates.name = trimmed.length > 0 ? trimmed.slice(0, 50) : null;
  }

  // 2. Bio (up to 280 chars)
  if (typeof body.bio === "string") {
    const trimmed = body.bio.trim();
    updates.bio = trimmed.length > 0 ? trimmed.slice(0, 280) : null;
  } else if (body.bio === null) {
    updates.bio = null;
  }

  // 3. Location
  if (typeof body.location === "string") {
    const trimmed = body.location.trim();
    updates.location = trimmed.length > 0 ? trimmed.slice(0, 60) : null;
  } else if (body.location === null) {
    updates.location = null;
  }

  // 4. Website
  if (typeof body.website === "string") {
    let trimmed = body.website.trim();
    if (trimmed.length > 0) {
      if (!/^https?:\/\//i.test(trimmed)) {
        trimmed = `https://${trimmed}`;
      }
      updates.website = trimmed.slice(0, 100);
    } else {
      updates.website = null;
    }
  } else if (body.website === null) {
    updates.website = null;
  }

  // 5. Banner image URL
  if (typeof body.banner === "string") {
    updates.banner = body.banner.trim().length > 0 ? body.banner.trim() : null;
  } else if (body.banner === null) {
    updates.banner = null;
  }

  // 6. Profile Avatar image URL
  if (typeof body.image === "string") {
    updates.image = body.image.trim().length > 0 ? body.image.trim() : null;
  } else if (body.image === null) {
    updates.image = null;
  }

  // 7. Handle (optional update if provided and different)
  if (typeof body.handle === "string") {
    const clean = body.handle.trim().replace(/^@+/, "");
    if (clean.length >= 3 && clean.length <= 40) {
      // Check if taken
      const existing = await prisma.user.findFirst({
        where: {
          handle: { equals: clean, mode: "insensitive" },
          id: { not: userId },
        },
      });
      if (existing) {
        return NextResponse.json({ error: "That handle is already taken." }, { status: 409 });
      }
      updates.handle = clean;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        handle: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        banner: true,
        location: true,
        website: true,
        blue_tick_status: true,
        aura_percentage: true,
        points: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error("[profile-api] Update error:", err);
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Unique constraint violated (e.g. handle taken)." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 }
    );
  }
}
