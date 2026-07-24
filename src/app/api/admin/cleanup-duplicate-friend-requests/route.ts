import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meId = (session.user as any).id as string;

    const authorized = await isAdmin(meId);
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all friend requests sorted by createdAt descending
    const allRequests = await prisma.friendRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Group requests by normalized pair (sorted user IDs so A:B == B:A)
    const grouped = new Map<string, typeof allRequests>();

    for (const req of allRequests) {
      const pairKey = [req.fromUserId, req.toUserId].sort().join(":");
      const list = grouped.get(pairKey) || [];
      list.push(req);
      grouped.set(pairKey, list);
    }

    const idsToDelete: string[] = [];

    for (const [, list] of grouped.entries()) {
      if (list.length <= 1) continue;

      // Select the single best request to keep for this pair:
      // 1. Prefer ACCEPTED request over PENDING/REJECTED
      // 2. If multiple have the same best status, keep the newest one (first in array since sorted desc)
      let bestReq = list[0];
      for (const req of list) {
        if (req.status === "ACCEPTED" && bestReq.status !== "ACCEPTED") {
          bestReq = req;
        }
      }

      // Mark all other duplicate requests in this group for deletion
      for (const req of list) {
        if (req.id !== bestReq.id) {
          idsToDelete.push(req.id);
        }
      }
    }

    let deletedCount = 0;
    if (idsToDelete.length > 0) {
      const result = await prisma.friendRequest.deleteMany({
        where: { id: { in: idsToDelete } },
      });
      deletedCount = result.count;
    }

    return NextResponse.json({
      ok: true,
      deletedCount,
      retainedPairs: grouped.size,
      totalBefore: allRequests.length,
      totalAfter: allRequests.length - deletedCount,
    });
  } catch (err: any) {
    console.error("[admin/cleanup-duplicate-friend-requests]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
