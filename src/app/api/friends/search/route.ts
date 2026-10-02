import { findSyntheticUser } from "@/lib/globalMockDirectory";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanHandle } from "@/lib/handle-utils";

export async function POST(request: Request) {
  try {
    const { handle } = await request.json();

    if (!handle || typeof handle !== "string") {
      return NextResponse.json({ error: "Missing handle" }, { status: 400 });
    }

    const raw = handle.trim();
    const cleaned = cleanHandle(raw);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { handle: { equals: raw, mode: "insensitive" } },
          { handle: { equals: cleaned, mode: "insensitive" } },
          { email: { equals: raw, mode: "insensitive" } },
          { id: raw },
          { name: { contains: cleaned, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        handle: true,
        name: true,
        email: true,
        image: true,
        blue_tick_status: true,
        createdAt: true,
      },
    });

    if (!user) {
      // Seamless lookup for global ecosystem synthetic users
      const synth = findSyntheticUser(cleaned) || findSyntheticUser(raw);
      if (synth) {
        return NextResponse.json({ user: synth });
      }
      return NextResponse.json({ error: `User "@${handle}" not found` }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[friends/search]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
