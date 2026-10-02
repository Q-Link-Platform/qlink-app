import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const body = await request.json().catch(() => ({} as any));
    const { publicKeyString, encryptedPrivateKey } = body;

    if (typeof publicKeyString !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing publicKeyString" },
        { status: 400 }
      );
    }

    if (encryptedPrivateKey !== undefined && typeof encryptedPrivateKey !== "string") {
      return NextResponse.json(
        { error: "Invalid encryptedPrivateKey format" },
        { status: 400 }
      );
    }

    // Update the user's public key and encrypted private key backup in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        publicKeyString,
        ...(encryptedPrivateKey !== undefined ? { encryptedPrivateKey } : {}),
      },
      select: {
        id: true,
        handle: true,
        publicKeyString: true,
        encryptedPrivateKey: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (err: any) {
    console.error("[api/user/public-key] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
