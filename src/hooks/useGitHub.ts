"use client";

import { useState, useCallback } from "react";

interface GitHubProfile {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
}

interface GitHubCommit {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
  author: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  } | null;
  committer: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  } | null;
}

interface GitHubStatus {
  connected: boolean;
  username?: string;
  tokenValid?: boolean;
  rateLimit?: {
    limit: string | null;
    remaining: string | null;
    reset: string | null;
  };
  scopes?: string | null;
  expiresAt?: number | null;
}

interface UseGitHubReturn {
  // Status
  status: GitHubStatus | null;
  loadingStatus: boolean;
  checkStatus: () => Promise<void>;

  // Profile
  profile: GitHubProfile | null;
  loadingProfile: boolean;
  fetchProfile: () => Promise<void>;

  // Repositories
  repos: GitHubRepo[];
  loadingRepos: boolean;
  fetchRepos: (params?: {
    type?: "owner" | "member" | "all";
    sort?: "created" | "updated" | "pushed" | "full_name";
    per_page?: number;
    page?: number;
  }) => Promise<void>;

  // Commits
  commits: GitHubCommit[];
  loadingCommits: boolean;
  fetchCommits: (
    owner: string,
    repo: string,
    params?: {
      sha?: string;
      per_page?: number;
      page?: number;
    }
  ) => Promise<void>;

  // Error handling
  error: string | null;
  clearError: () => void;
}

export function useGitHub(): UseGitHubReturn {
  // Status state
  const [status, setStatus] = useState<GitHubStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Repos state
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  // Commits state
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [loadingCommits, setLoadingCommits] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const checkStatus = useCallback(async () => {
    setLoadingStatus(true);
    setError(null);
    try {
      const res = await fetch("/api/github/status");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to check GitHub status");
        return;
      }

      setStatus(data);
    } catch (err) {
      setError("Network error checking GitHub status");
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    setError(null);
    try {
      const res = await fetch("/api/github/profile");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch GitHub profile");
        return;
      }

      setProfile(data.profile);
    } catch (err) {
      setError("Network error fetching GitHub profile");
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchRepos = useCallback(
    async (params?: {
      type?: "owner" | "member" | "all";
      sort?: "created" | "updated" | "pushed" | "full_name";
      per_page?: number;
      page?: number;
    }) => {
      setLoadingRepos(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.set("type", params.type);
        if (params?.sort) queryParams.set("sort", params.sort);
        if (params?.per_page) queryParams.set("per_page", params.per_page.toString());
        if (params?.page) queryParams.set("page", params.page.toString());

        const res = await fetch(`/api/github/repos?${queryParams.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch repositories");
          return;
        }

        setRepos(data.repos);
      } catch (err) {
        setError("Network error fetching repositories");
      } finally {
        setLoadingRepos(false);
      }
    },
    []
  );

  const fetchCommits = useCallback(
    async (
      owner: string,
      repo: string,
      params?: {
        sha?: string;
        per_page?: number;
        page?: number;
      }
    ) => {
      setLoadingCommits(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("owner", owner);
        queryParams.set("repo", repo);
        if (params?.sha) queryParams.set("sha", params.sha);
        if (params?.per_page) queryParams.set("per_page", params.per_page.toString());
        if (params?.page) queryParams.set("page", params.page.toString());

        const res = await fetch(`/api/github/commits?${queryParams.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch commits");
          return;
        }

        setCommits(data.commits);
      } catch (err) {
        setError("Network error fetching commits");
      } finally {
        setLoadingCommits(false);
      }
    },
    []
  );

  return {
    // Status
    status,
    loadingStatus,
    checkStatus,

    // Profile
    profile,
    loadingProfile,
    fetchProfile,

    // Repos
    repos,
    loadingRepos,
    fetchRepos,

    // Commits
    commits,
    loadingCommits,
    fetchCommits,

    // Error
    error,
    clearError,
  };
}
