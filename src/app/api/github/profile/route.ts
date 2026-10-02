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

    // Get user with GitHub account
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find GitHub account
    const githubAccount = user.accounts.find(
      (account) => account.provider === "github"
    );

    if (!githubAccount?.access_token) {
      return NextResponse.json(
        { error: "GitHub not connected" },
        { status: 400 }
      );
    }

    // Fetch GitHub profile
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubAccount.access_token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Quantum-Link-App",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Failed to fetch GitHub profile", details: error },
        { status: response.status }
      );
    }

    const profile = await response.json();

    return NextResponse.json({
      success: true,
      profile: {
        login: profile.login,
        id: profile.id,
        avatar_url: profile.avatar_url,
        html_url: profile.html_url,
        name: profile.name,
        company: profile.company,
        blog: profile.blog,
        location: profile.location,
        email: profile.email,
        bio: profile.bio,
        public_repos: profile.public_repos,
        public_gists: profile.public_gists,
        followers: profile.followers,
        following: profile.following,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
    });
  } catch (error) {
    console.error("GitHub profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
