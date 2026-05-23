import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const sha = searchParams.get("sha") || "main"; // branch name or commit SHA
    const perPage = parseInt(searchParams.get("per_page") || "30", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Missing required parameters: owner and repo" },
        { status: 400 }
      );
    }

    // Get user with GitHub account
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

    if (!githubAccount?.access_token) {
      return NextResponse.json(
        { error: "GitHub not connected" },
        { status: 400 }
      );
    }

    // Fetch commits
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?sha=${sha}&per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${githubAccount.access_token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Quantum-Link-App",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Failed to fetch commits", details: error },
        { status: response.status }
      );
    }

    const commits = await response.json();

    // Format response
    const formattedCommits = commits.map((commit: any) => ({
      sha: commit.sha,
      node_id: commit.node_id,
      commit: {
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date,
        },
        committer: {
          name: commit.commit.committer.name,
          email: commit.commit.committer.email,
          date: commit.commit.committer.date,
        },
        message: commit.commit.message,
      },
      html_url: commit.html_url,
      author: commit.author
        ? {
            login: commit.author.login,
            id: commit.author.id,
            avatar_url: commit.author.avatar_url,
            html_url: commit.author.html_url,
          }
        : null,
      committer: commit.committer
        ? {
            login: commit.committer.login,
            id: commit.committer.id,
            avatar_url: commit.committer.avatar_url,
            html_url: commit.committer.html_url,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      commits: formattedCommits,
      repository: `${owner}/${repo}`,
      branch: sha,
      pagination: {
        page,
        per_page: perPage,
        total_count: commits.length,
      },
    });
  } catch (error) {
    console.error("GitHub commits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
