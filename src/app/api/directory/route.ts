import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple public directory of quantum IDs with their posts.
// Returns all users that have a handle set, ranked by createdAt, with their latest posts.
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        handle: { not: null },
        email: { notIn: ["majidhafiz371@gmail.com"] },
        id: { notIn: ["cmrnfqw3h00003xy7oiddim7r"] }
      },
      select: {
        id: true,
        handle: true,
        name: true,
        image: true,
        createdAt: true,
        aura_percentage: true,
        blue_tick_status: true,
        points: true,
        posts: {
          select: {
            id: true,
            text: true,
            audience: true,
            attachmentId: true,
            attachmentKind: true,
            createdAt: true,
            expiresAt: true,
            _count: {
              select: {
                reactions: true,
                comments: true,
                views: true,
              },
            },
          },
          where: {
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 3, // Latest 3 posts per user
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const items = users.map((u) => {
      const handle = u.handle as string | null;
      const isRedTick = handle === "Rohit_7779";
      const isDiamond = u.blue_tick_status === "DIAMOND";
      const isSapphire = u.blue_tick_status === "SAPPHIRE";
      
      // Aura Multipliers for VIP Tiers!
      let auraPercentage = u.aura_percentage || 0;
      if (isDiamond) {
        auraPercentage = Math.round(auraPercentage * 2.0);
      } else if (isSapphire) {
        auraPercentage = Math.round(auraPercentage * 1.5);
      }

      return {
        id: u.id,
        handle,
        name: u.name,
        image: u.image,
        rank: 9999, // Will re-assign below after sorting
        isRedTick,
        auraPercentage,
        blueTickStatus: u.blue_tick_status || 'none',
        points: u.points || 0,
        posts: u.posts.map(post => ({
          id: post.id,
          text: post.text,
          audience: post.audience,
          attachmentId: post.attachmentId,
          attachmentKind: post.attachmentKind,
          createdAt: post.createdAt,
          expiresAt: post.expiresAt,
          _count: post._count,
        })),
      };
    });

    // Sort: Red Tick (Elite Founder) -> Diamond VIPs -> Sapphire VIPs -> Standard Verified -> Standard
    items.sort((a, b) => {
      // 1. Red Tick Elite Founder first
      if (a.isRedTick && !b.isRedTick) return -1;
      if (!a.isRedTick && b.isRedTick) return 1;

      // 2. Diamond VIP second
      const aIsDiamond = a.blueTickStatus === "DIAMOND";
      const bIsDiamond = b.blueTickStatus === "DIAMOND";
      if (aIsDiamond && !bIsDiamond) return -1;
      if (!aIsDiamond && bIsDiamond) return 1;

      // 3. Sapphire VIP third
      const aIsSapphire = a.blueTickStatus === "SAPPHIRE";
      const bIsSapphire = b.blueTickStatus === "SAPPHIRE";
      if (aIsSapphire && !bIsSapphire) return -1;
      if (!aIsSapphire && bIsSapphire) return 1;

      // 4. Standard verified fourth
      const aIsVerified = a.blueTickStatus === "verified";
      const bIsVerified = b.blueTickStatus === "verified";
      if (aIsVerified && !bIsVerified) return -1;
      if (!aIsVerified && bIsVerified) return 1;

      return 0; // Maintain original createdAt asc order
    });


    // Re-assign ranks based on sorted prioritised list
    items.forEach((item, index) => {
      item.rank = index + 1;
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[directory]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
