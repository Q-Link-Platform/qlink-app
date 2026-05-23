'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserStats {
  points: number;
  auraPercentage: number;
  blueTickStatus: string;
  profilePhotoUrl?: string;
  memberSince: string;
  lastSeen?: string;
}

interface EngagementStats {
  totalLikes: number;
  totalComments: number;
  totalFollows: number;
  totalReferrals: number;
  recentPosts: number;
  recentComments: number;
  recentLikes: number;
}

export default function UserAnalytics() {
  const { data: session } = useSession();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [engagementStats, setEngagementStats] = useState<EngagementStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      trackAnalytics();
    }
  }, [session]);

  const trackAnalytics = async () => {
    try {
      const userId = (session?.user as any)?.id || session?.user?.email;
      
      // Track current visit
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      
      if (data.success) {
        setUserStats(data.user);
        setEngagementStats(data.stats);
      }
    } catch (error) {
      console.error('Error tracking analytics:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-slate-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="text-indigo-400">📊</span>
          User Analytics
        </h3>
        <p className="text-sm text-slate-400">
          Your activity statistics and engagement metrics
        </p>
      </div>

      {/* User Profile Stats */}
      {userStats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-2xl font-bold text-indigo-400">{userStats.points}</p>
            <p className="text-xs text-slate-400">Total Points</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className={`text-2xl font-bold ${getAuraColor(userStats.auraPercentage)}`}>
              {userStats.auraPercentage}%{getAuraEmoji(userStats.auraPercentage)}
            </p>
            <p className="text-xs text-slate-400">Aura Level</p>
          </div>
        </div>
      )}

      {/* Engagement Breakdown */}
      {engagementStats && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-300">Engagement Breakdown:</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-800/30 rounded-lg p-2">
              <p className="text-slate-400">❤️ Total Likes:</p>
              <p className="text-lg font-bold text-slate-200">{engagementStats.totalLikes}</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-2">
              <p className="text-slate-400">💬 Total Comments:</p>
              <p className="text-lg font-bold text-slate-200">{engagementStats.totalComments}</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-2">
              <p className="text-slate-400">👥 Total Follows:</p>
              <p className="text-lg font-bold text-slate-200">{engagementStats.totalFollows}</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-2">
              <p className="text-slate-400">🎯 Total Referrals:</p>
              <p className="text-lg font-bold text-slate-200">{engagementStats.totalReferrals}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {engagementStats && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-300">Recent Activity (Last 7 Days):</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-800/30 rounded-lg p-2 text-center">
              <p className="text-slate-400">📝 Posts</p>
              <p className="text-lg font-bold text-slate-200">{engagementStats.recentPosts}</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-2 text-center">
              <p className="text-slate-400">💬 Comments</p>
              <p className="text-lg font-bold text-slate-200">{engagementStats.recentComments}</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-2 text-center">
              <p className="text-slate-400">❤️ Likes</p>
              <p className="text-lg font-bold text-slate-200">{engagementStats.recentLikes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Account Info */}
      {userStats && (
        <div className="border-t border-slate-700/60 pt-4 space-y-2">
          <p className="text-sm font-medium text-slate-300">Account Information:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">Member Since:</span>
              <span className="ml-1 text-slate-200">
                {new Date(userStats.memberSince).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Blue Tick Status:</span>
              <span className={`ml-1 font-medium ${
                userStats.blueTickStatus === 'verified' ? 'text-green-400' : 
                userStats.blueTickStatus === 'pending' ? 'text-yellow-400' : 'text-gray-400'
              }`}>
                {userStats.blueTickStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
