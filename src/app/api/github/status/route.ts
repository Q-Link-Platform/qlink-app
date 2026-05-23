import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const githubAccount = user.accounts.find(
      (account) => account.provider === "github"
    );

    if (!githubAccount) {
      return NextResponse.json({
        connected: false,
        message: "GitHub account not connected",
      });
    }

    // Check if token is valid by making a simple API call
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubAccount.access_token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Quantum-Link-App",
      },
    });

    const rateLimit = {
      limit: response.headers.get("x-ratelimit-limit"),
      remaining: response.headers.get("x-ratelimit-remaining"),
      reset: response.headers.get("x-ratelimit-reset"),
    };

    return NextResponse.json({
      connected: response.ok,
      username: githubAccount.providerAccountId,
      tokenValid: response.ok,
      rateLimit: response.ok ? rateLimit : null,
      scopes: githubAccount.scope,
      expiresAt: githubAccount.expires_at,
    });
  } catch (error) {
    console.error("GitHub status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
