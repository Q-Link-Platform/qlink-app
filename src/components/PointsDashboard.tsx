'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface PointsData {
  points: number;
  auraPercentage: number;
  breakdown: {
    likes: number;
    comments: number;
    follows: number;
    referrals: number;
  };
}

export default function PointsDashboard() {
  const { data: session } = useSession();
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState<any>(null);

  useEffect(() => {
    if (session?.user) {
      // For now, we'll need to get user ID from handle or another method
      // This is a temporary solution - you may need to adjust based on your auth setup
      const userId = (session.user as any)?.id || session.user.email;
      if (userId) {
        fetchPointsData(userId);
        fetchReferralData(userId);
      }
    }
  }, [session]);

  const fetchPointsData = async (userId: string) => {
    try {
      const response = await fetch('/api/points/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (data.success) {
        setPointsData(data);
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralData = async (userId: string) => {
    try {
      const response = await fetch(`/api/referral/generate?userId=${userId}`);
      const data = await response.json();
      setReferralData(data);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  };

  const getAuraColor = (percentage: number) => {
    if (percentage === 0) return 'text-gray-400';
    if (percentage === 50) return 'text-orange-400';
    if (percentage === 100) return 'text-orange-300';
    if (percentage === 1000) return 'text-green-400';
    if (percentage === 10500) return 'text-red-400';
    if (percentage === 999999) return 'text-red-600';
    return 'text-gray-400';
  };

  const getAuraEmoji = (percentage: number) => {
    if (percentage === 999999) return ' ☠️';
    return '';
  };

  const copyReferralLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      // You could add a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="quantum-skeleton-card rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 space-y-4 relative overflow-hidden animate-in fade-in duration-200">
        <div className="quantum-skeleton-shimmer" />
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-cyan-500/30 border border-cyan-400/40 flex items-center justify-center text-[10px] text-cyan-300">⚡</div>
            <div className="h-4 w-32 rounded-full bg-slate-800" />
          </div>
          <div className="h-2.5 w-48 rounded-full bg-slate-800/60" />
        </div>

        {/* 2 Metric Cards Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-3 space-y-1.5 border border-slate-700/40">
            <div className="h-7 w-16 rounded-full bg-cyan-900/50 border border-cyan-500/30" />
            <div className="h-2.5 w-18 rounded-full bg-slate-800/70" />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 space-y-1.5 border border-slate-700/40">
            <div className="h-7 w-20 rounded-full bg-slate-800" />
            <div className="h-2.5 w-16 rounded-full bg-slate-800/70" />
          </div>
        </div>

        {/* Breakdown rows */}
        <div className="space-y-2 pt-1">
          <div className="h-3 w-28 rounded-full bg-slate-800/80" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-slate-800/40 border border-slate-700/30 p-2" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="text-cyan-400">⚡</span>
          Points & Aura
        </h3>
        <p className="text-sm text-slate-400">Your engagement score and referral rewards</p>
      </div>

      {/* Points Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-3">
          <p className="text-2xl font-bold text-cyan-400">{pointsData?.points || 0}</p>
          <p className="text-xs text-slate-400">Total Points</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3">
          <p className={`text-2xl font-bold ${getAuraColor(pointsData?.auraPercentage || 0)}`}>
            {pointsData?.auraPercentage || 0}%{getAuraEmoji(pointsData?.auraPercentage || 0)}
          </p>
          <p className="text-xs text-slate-400">Aura Level</p>
        </div>
      </div>

      {/* Points Breakdown */}
      {pointsData && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-300">Points Breakdown:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">❤️ Likes:</span>
              <span className="text-slate-200">{pointsData.breakdown.likes} × 1 = {pointsData.breakdown.likes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">💬 Comments:</span>
              <span className="text-slate-200">{pointsData.breakdown.comments} × 2 = {pointsData.breakdown.comments * 2}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">👥 Follows:</span>
              <span className="text-slate-200">{pointsData.breakdown.follows} × 3 = {pointsData.breakdown.follows * 3}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">🎯 Referrals:</span>
              <span className="text-slate-200">{pointsData.breakdown.referrals} × 10 = {pointsData.breakdown.referrals * 10}</span>
            </div>
          </div>
        </div>
      )}

      {/* Referral Section */}
      {referralData && (
        <div className="border-t border-slate-700/60 pt-4">
          <p className="text-sm font-medium text-slate-300 mb-2">Referral Link:</p>
          <div className="bg-slate-800/50 rounded-lg p-2 flex items-center justify-between">
            <p className="text-xs text-slate-400 truncate flex-1">{referralData.referralLink}</p>
            <button
              onClick={copyReferralLink}
              className="ml-2 px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded text-xs transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Share this link and earn 10 points for both you and your friend!
          </p>
        </div>
      )}

      {/* Blue Tick Status */}
      <div className="border-t border-slate-700/60 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">Blue Tick Status:</p>
            <p className="text-xs text-slate-400">
              {(pointsData?.points ?? 0) >= 100 
                ? "🎉 Eligible for Blue Tick! Apply now." 
                : `📈 Need ${100 - (pointsData?.points ?? 0)} more points for Blue Tick`}
            </p>
          </div>
          {(pointsData?.points ?? 0) >= 100 && (
            <button className="px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg text-xs transition-colors">
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
