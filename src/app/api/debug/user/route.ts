import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    
    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        image: true,
      },
    });

    return NextResponse.json({ 
      session: {
        userId,
        email: session.user.email,
        name: session.user.name,
      },
      databaseUser: user 
    });
  } catch (err: any) {
    console.error("[debug/user]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
