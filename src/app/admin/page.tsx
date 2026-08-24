"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AdminUser {
  id: string;
  handle: string;
  rawHandle: string;
  name: string;
  email: string;
  createdAt: string;
  blueTickStatus: string;
  points: number;
  postsCount: number;
  commentsCount: number;
  sessionsCount: number;
  pushCount: number;
}

interface AdminMetrics {
  totalUsers: number;
  verifiedUsers: number;
  totalPosts: number;
  totalConnections: number;
  timestamp: string;
}

export default function AdminCommandCenterPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "compliance" | "security">("users");

  // Compliance Export Form State
  const [warrantTarget, setWarrantTarget] = useState("");
  const [warrantRefId, setWarrantRefId] = useState("");
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [complianceReport, setComplianceReport] = useState<any | null>(null);
  const [complianceError, setComplianceError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // User Action State
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) {
        if (res.status === 403) {
          setError("Access Denied: Platform Administrator clearance required.");
        } else {
          setError("Failed to fetch command center metrics.");
        }
        return;
      }
      const data = await res.json();
      setMetrics(data.metrics);
      setUsers(data.users || []);
    } catch {
      setError("Network error connecting to telemetry pipeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleGenerateCompliance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warrantTarget.trim()) return;

    setComplianceLoading(true);
    setComplianceError(null);
    setComplianceReport(null);
    try {
      const res = await fetch("/api/admin/compliance/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetIdentifier: warrantTarget.trim(),
          warrantReferenceId: warrantRefId.trim() || "WARRANT-DIRECT-INSPECTION",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setComplianceError(data.error || "Failed to generate compliance package.");
        return;
      }

      setComplianceReport(data.report);
    } catch {
      setComplianceError("Network error generating legal report.");
    } finally {
      setComplianceLoading(false);
    }
  };

  const copyReportJson = () => {
    if (!complianceReport) return;
    navigator.clipboard.writeText(JSON.stringify(complianceReport, null, 2));
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.handle.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gradient-to-b from-cyan-600/10 via-transparent to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="font-bold tracking-wider text-base bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
              Q-LINK
            </span>
          </div>
          <span className="h-4 w-[1px] bg-slate-800" />
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300 tracking-wide">
            OPERATIONS COMMAND CENTER
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Sync Live</span>
          </button>

          <Link
            href="/"
            className="rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Return to App</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
            <Link href="/" className="underline hover:text-white text-xs">Return Home</Link>
          </div>
        )}

        {/* Action Alert */}
        {actionSuccess && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 text-emerald-300 text-sm flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white text-xs">Dismiss</button>
          </div>
        )}

        {/* KPI Metrics Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Users</p>
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white mt-3">{metrics ? metrics.totalUsers : "--"}</p>
            <p className="text-[11px] text-slate-500 mt-1">Active cryptographic nodes</p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Verified VIPs</p>
              <div className="h-8 w-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white mt-3">{metrics ? metrics.verifiedUsers : "--"}</p>
            <p className="text-[11px] text-slate-500 mt-1">Diamond / Gold badge accounts</p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Broadcast Posts</p>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white mt-3">{metrics ? metrics.totalPosts : "--"}</p>
            <p className="text-[11px] text-slate-500 mt-1">Community feed posts & shorts</p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Connection Links</p>
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white mt-3">{metrics ? metrics.totalConnections : "--"}</p>
            <p className="text-[11px] text-slate-500 mt-1">E2EE Tunnel Requests</p>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("users")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
              activeTab === "users"
                ? "border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Live User Registry ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("compliance")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
              activeTab === "compliance"
                ? "border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Legal Compliance & Warrant Exporter</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
              activeTab === "security"
                ? "border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Security & E2EE Relay Status</span>
          </button>
        </section>

        {/* TAB 1: User Registry */}
        {activeTab === "users" && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Filter by handle, name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/70 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all"
                />
              </div>
              <p className="text-xs text-slate-500">Showing {filteredUsers.length} registered profiles</p>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">User Identity</th>
                      <th className="px-4 py-3.5">Email / Auth</th>
                      <th className="px-4 py-3.5">Verified Badge</th>
                      <th className="px-4 py-3.5 text-right">Aura (QP)</th>
                      <th className="px-4 py-3.5 text-right">Posts</th>
                      <th className="px-4 py-3.5">Registered</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-200">
                              {u.handle.slice(1, 3).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-200">{u.handle}</p>
                              <p className="text-[10px] text-slate-500">{u.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">{u.email}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              u.blueTickStatus === "DIAMOND"
                                ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-300"
                                : u.blueTickStatus === "GOLD"
                                ? "border-amber-400/50 bg-amber-500/10 text-amber-300"
                                : "border-slate-700 bg-slate-800/60 text-slate-400"
                            }`}
                          >
                            {u.blueTickStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-200">{u.points.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right text-slate-400">{u.postsCount}</td>
                        <td className="px-4 py-3.5 text-slate-500 text-[11px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setWarrantTarget(u.rawHandle || u.email);
                              setActiveTab("compliance");
                            }}
                            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 text-[10px] font-medium text-cyan-300 transition-all"
                          >
                            Inspect / Audit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: Legal Compliance & Warrant Exporter */}
        {activeTab === "compliance" && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  Official Legal Compliance & Warrant Package Generator
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Generate authentic, tamper-evident Law Enforcement Response Packages with SHA-256 integrity checksums for verified court orders or subpoenas.
                </p>
              </div>

              <form onSubmit={handleGenerateCompliance} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Target Handle, Email, or User ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. @Rohit_7779 or user@example.com"
                    value={warrantTarget}
                    onChange={(e) => setWarrantTarget(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Warrant Reference ID / Case File
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SUBPOENA-2026-CRIM-9912"
                    value={warrantRefId}
                    onChange={(e) => setWarrantRefId(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={complianceLoading}
                    className="w-full rounded-xl border border-cyan-400/60 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all active:scale-95 disabled:opacity-50"
                  >
                    {complianceLoading ? "Compiling Package..." : "Export Compliance Package"}
                  </button>
                </div>
              </form>

              {complianceError && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-rose-300 text-xs">
                  {complianceError}
                </div>
              )}
            </div>

            {/* Generated Report Display */}
            {complianceReport && (
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-6 backdrop-blur-md space-y-4 shadow-[0_0_30px_rgba(6,182,212,0.08)]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                      {complianceReport.complianceReportId}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">
                      Target Account: {complianceReport.targetAccount?.quantumHandle}
                    </h4>
                  </div>
                  <button
                    onClick={copyReportJson}
                    className="rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all flex items-center gap-1.5"
                  >
                    <span>{copiedHash ? "Copied!" : "Copy Full JSON"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Account Identity</p>
                    <p className="text-slate-200 font-mono"><span className="text-slate-500">User ID:</span> {complianceReport.targetAccount?.userId}</p>
                    <p className="text-slate-200 font-mono"><span className="text-slate-500">Email:</span> {complianceReport.targetAccount?.registeredEmail || "N/A"}</p>
                    <p className="text-slate-200 font-mono"><span className="text-slate-500">Created:</span> {new Date(complianceReport.targetAccount?.createdAt).toLocaleString()}</p>
                    <p className="text-slate-200 font-mono"><span className="text-slate-500">Status:</span> {complianceReport.targetAccount?.accountStatus}</p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Integrity & E2EE Disclosure</p>
                    <p className="text-slate-200 font-mono truncate"><span className="text-slate-500">SHA-256:</span> {complianceReport.integrityVerification?.sha256Checksum}</p>
                    <p className="text-slate-200 font-mono"><span className="text-slate-500">Encryption:</span> {complianceReport.encryptionDisclosure?.protocol}</p>
                    <p className="text-[11px] text-cyan-300/80 italic mt-1">{complianceReport.encryptionDisclosure?.disclosureStatement}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                  <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-72 p-2">
                    {JSON.stringify(complianceReport, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 3: Security Status */}
        {activeTab === "security" && (
          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm space-y-4">
            <h3 className="text-base font-bold text-white">Cryptographic Relay & Infrastructure Security</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-slate-400 font-semibold">E2EE Tunnel Relay</p>
                <p className="text-emerald-400 font-bold mt-1 text-sm flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Zero-Knowledge Active
                </p>
                <p className="text-slate-500 text-[11px] mt-1">X25519 authenticated direct key exchange</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-slate-400 font-semibold">Web Push Gateway</p>
                <p className="text-cyan-400 font-bold mt-1 text-sm flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  VAPID Active
                </p>
                <p className="text-slate-500 text-[11px] mt-1">Encrypted browser push delivery active</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-slate-400 font-semibold">Audit Retention</p>
                <p className="text-slate-200 font-bold mt-1 text-sm">Server Log Isolation</p>
                <p className="text-slate-500 text-[11px] mt-1">Tamper-evident legal compliance export enabled</p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
