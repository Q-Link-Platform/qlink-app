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
    const type = searchParams.get("type") || "owner"; // owner, member, all
    const sort = searchParams.get("sort") || "updated"; // created, updated, pushed, full_name
    const perPage = parseInt(searchParams.get("per_page") || "30", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

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

    // Fetch repositories
    const response = await fetch(
      `https://api.github.com/user/repos?type=${type}&sort=${sort}&per_page=${perPage}&page=${page}`,
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
        { error: "Failed to fetch repositories", details: error },
        { status: response.status }
      );
    }

    const repos = await response.json();

    // Format response
    const formattedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      html_url: repo.html_url,
      description: repo.description,
      fork: repo.fork,
      url: repo.url,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      homepage: repo.homepage,
      size: repo.size,
      stargazers_count: repo.stargazers_count,
      watchers_count: repo.watchers_count,
      language: repo.language,
      forks_count: repo.forks_count,
      open_issues_count: repo.open_issues_count,
      default_branch: repo.default_branch,
    }));

    return NextResponse.json({
      success: true,
      repos: formattedRepos,
      pagination: {
        page,
        per_page: perPage,
        total_count: repos.length,
      },
    });
  } catch (error) {
    console.error("GitHub repos error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
