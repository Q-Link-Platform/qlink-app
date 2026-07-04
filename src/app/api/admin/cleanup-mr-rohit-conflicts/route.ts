import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

// Dev/admin-only endpoint to clean up stray friend requests
// involving temporary mr_rohit_* handles created during VIP handle migration.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meId = (session.user as any).id as string;

    // Only allow admins to run this cleanup
    const authorized = await isAdmin(meId);
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find any users whose handle starts with the temporary mr_rohit_ prefix
    const junkUsers = await prisma.user.findMany({
      where: {
        handle: {
          startsWith: "mr_rohit_",
          mode: "insensitive",
        },
      },
      select: { id: true, handle: true },
    });

    if (junkUsers.length === 0) {
      return NextResponse.json({ ok: true, deletedRequests: 0, junkUsers: [] });
    }

    const junkIds = junkUsers.map((u) => u.id);

    const deleted = await prisma.friendRequest.deleteMany({
      where: {
        OR: [{ fromUserId: { in: junkIds } }, { toUserId: { in: junkIds } }],
      },
    });

    return NextResponse.json({
      ok: true,
      deletedRequests: deleted.count,
      junkUsers,
    });
  } catch (err: any) {
    console.error("[admin/cleanup-mr-rohit-conflicts]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
