'use client';

import { useState } from 'react';

interface BlueTickCardProps {
  user: {
    id: string;
    name?: string;
    handle: string;
    blue_tick_status: string;
    aura_percentage: number;
    points: number;
  };
}

export default function BlueTickCard({ user }: BlueTickCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const isBlueTick = user.blue_tick_status === 'verified';
  const isPending = user.blue_tick_status === 'pending';

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

  return (
    <div className="founder-vip-aurora gpu-accelerated rounded-2xl border border-sky-500/80 bg-slate-950/95 p-2.5 shadow-[0_0_30px_rgba(56,189,248,0.55)]">
      <div className="founder-vip-aurora-inner founder-vip-shine space-y-1.5 rounded-2xl bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 px-3 py-2 relative overflow-hidden">
        <div className="founder-vip-line-full absolute inset-0"></div>
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-slate-50 flex items-center gap-1">
              {isBlueTick && (
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-sky-300 bg-sky-500 text-[8px] font-bold text-slate-50">
                  ✓
                </span>
              )}
              @{user.handle}
            </p>
            <p className="text-[10px] font-semibold text-slate-200">
              {user.name || 'Verified User'}
            </p>
          </div>
          <div className="relative z-10">
            <span className="rounded-full border border-sky-400/80 bg-sky-500/20 px-2 py-0.5 text-[9px] font-medium text-sky-200">
              {isBlueTick ? 'Blue Tick' : isPending ? 'Pending' : 'Standard'}
            </span>
          </div>
        </div>
        
        {/* Aura Display */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold ${getAuraColor(user.aura_percentage)}`}>
              Aura: {user.aura_percentage}%{getAuraEmoji(user.aura_percentage)}
            </span>
            <span className="text-[10px] text-slate-400">
              • {user.points} points
            </span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[10px] text-slate-400 hover:text-slate-300 transition-colors"
          >
            {showDetails ? '▼' : 'ⓘ'}
          </button>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="relative z-10 mt-2 border-t border-slate-700/60 pt-2">
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-400">Status:</span>
                <span className={`ml-1 font-medium ${
                  isBlueTick ? 'text-green-400' : 
                  isPending ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {user.blue_tick_status.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Points:</span>
                <span className="ml-1 font-medium text-slate-200">{user.points}</span>
              </div>
              <div>
                <span className="text-slate-400">Aura:</span>
                <span className={`ml-1 font-medium ${getAuraColor(user.aura_percentage)}`}>
                  {user.aura_percentage}%
                </span>
              </div>
              <div>
                <span className="text-slate-400">Type:</span>
                <span className="ml-1 font-medium text-slate-200">
                  {isBlueTick ? 'Verified ID' : 'Standard User'}
                </span>
              </div>
            </div>
            
            {isBlueTick && (
              <div className="mt-2 text-[9px] text-sky-300">
                ✅ This account has been verified as a real person or brand
              </div>
            )}
            
            {isPending && (
              <div className="mt-2 text-[9px] text-yellow-300">
                ⏳ Verification application is under review
              </div>
            )}
          </div>
        )}
        
        <p className="relative z-10 text-[10px] text-slate-400">
          Tap to open this verified user and send a direct connection request.
        </p>
      </div>
    </div>
  );
}
