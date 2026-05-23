'use client';

import React, { useEffect, useState } from 'react';

interface AuraHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuraHelpModal({ isOpen, onClose }: AuraHelpModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTier, setActiveTier] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 150);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const auraTiers = [
    { 
      level: 0, 
      name: 'No Aura', 
      percentage: '0%', 
      color: 'from-gray-600 to-gray-700',
      borderColor: 'border-gray-500/60',
      bgColor: 'bg-gray-500/5',
      textColor: 'text-gray-400',
      titleColor: 'text-gray-200',
      description: 'Initial phase - Every legend begins their journey here',
      icon: '🌑'
    },
    { 
      level: 1, 
      name: 'Rising Star', 
      percentage: '50%', 
      color: 'from-orange-500 to-amber-500',
      borderColor: 'border-orange-500/60',
      bgColor: 'bg-orange-500/5',
      textColor: 'text-orange-400',
      titleColor: 'text-orange-200',
      description: 'Emerging presence - Building your digital footprint with purpose',
      icon: '🌟'
    },
    { 
      level: 2, 
      name: 'Active User', 
      percentage: '100%', 
      color: 'from-yellow-400 to-amber-500',
      borderColor: 'border-yellow-500/60',
      bgColor: 'bg-yellow-500/5',
      textColor: 'text-yellow-300',
      titleColor: 'text-yellow-200',
      description: 'Consistent engagement - Establishing meaningful connections daily',
      icon: '⚡'
    },
    { 
      level: 3, 
      name: 'Influencer', 
      percentage: '1000%', 
      color: 'from-emerald-500 to-green-500',
      borderColor: 'border-green-500/60',
      bgColor: 'bg-green-500/5',
      textColor: 'text-green-400',
      titleColor: 'text-green-200',
      description: 'Thought leadership - Shaping conversations and inspiring communities',
      icon: '👑'
    },
    { 
      level: 4, 
      name: 'Expert', 
      percentage: '10500%', 
      color: 'from-purple-600 to-violet-600',
      borderColor: 'border-purple-600/60',
      bgColor: 'bg-purple-600/5',
      textColor: 'text-purple-400',
      titleColor: 'text-purple-200',
      description: 'Mastery achieved - Recognized authority with exceptional contributions',
      icon: '🔥'
    },
    { 
      level: 5, 
      name: 'Legendary', 
      percentage: '999999%', 
      color: 'from-red-500 to-pink-500',
      borderColor: 'border-red-500/60',
      bgColor: 'bg-red-500/5',
      textColor: 'text-red-400',
      titleColor: 'text-red-200',
      description: 'Immortal status - Transcendent achievement that defines eras',
      icon: '☠️'
    }
  ];

  return (
    <div 
      className={`absolute inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'bg-slate-950/60 backdrop-blur-md opacity-100' : 'bg-slate-950/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      <div 
        className={`relative w-full max-w-[420px] transform transition-all duration-300 ease-out ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Premium glassmorphism card with animated border */}
        <div className="relative rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.18)] border border-slate-800/60">
          
          {/* Main content */}
          <div className="relative bg-slate-950/90 rounded-3xl backdrop-blur-xl p-5 overflow-hidden flex flex-col gap-[16px]">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-cyan-500/15 via-purple-500/10 to-pink-500/15 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-gradient-to-tr from-purple-500/15 via-pink-500/10 to-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Header */}
            <div className="relative pb-[11px] border-b border-slate-800/60 z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <span className="text-white text-[11px] font-bold">A</span>
                    </div>
                    <div>
                      <p className="text-[8.5px] font-semibold uppercase tracking-[0.2em] bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        Aura System
                      </p>
                      <h2 className="text-base font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                        What is Aura?
                      </h2>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal mt-1.5">
                    Your sophisticated engagement metric that quantifies your digital influence and community impact.
                  </p>
                </div>
                
                {/* Premium Larger Close Button - Scaled up 20% */}
                <button
                  type="button"
                  onClick={onClose}
                  className="group relative w-8.5 h-8.5 rounded-full border border-slate-700/60 bg-slate-900/90 flex items-center justify-center transition-all duration-200 hover:border-red-400/80 hover:bg-red-500/10 hover:scale-105 active:scale-95 hover:shadow-lg cursor-pointer z-20"
                  aria-label="Close aura guide"
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-25 transition-opacity duration-200" />
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-red-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Aura Tiers */}
            <div className="relative flex-1 overflow-hidden space-y-1 z-10">
              <div className="space-y-1.5">
                {auraTiers.map((tier, index) => (
                  <div
                    key={tier.level}
                    className={`group relative rounded-xl border ${tier.borderColor} ${tier.bgColor} py-[8.5px] px-2.5 transition-all duration-200 cursor-pointer hover:scale-[1.01] hover:shadow-md ${
                      activeTier === tier.level ? 'ring-1 ring-cyan-400/50 shadow-cyan-500/20 scale-[1.01]' : ''
                    }`}
                    onMouseEnter={() => setActiveTier(tier.level)}
                    onMouseLeave={() => setActiveTier(null)}
                    style={{
                      animationDelay: `${index * 80}ms`,
                      animation: isOpen ? 'slideInUp 0.4s ease-out forwards' : 'none'
                    }}
                  >
                    {/* Hover glow effect */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tier.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />
                    
                    <div className="relative flex items-center gap-2.5">
                      {/* Icon - Scaled up 20% */}
                      <div className={`flex items-center justify-center text-sm font-bold ${
                        tier.level === 5 ? 'w-6 h-6 transform transition-all duration-200 group-hover:scale-110 group-hover:rotate-12' : `w-6 h-6 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center text-white shadow-lg transform transition-all duration-200 group-hover:scale-110 group-hover:rotate-12`
                      }`}>
                        <span className="text-[12px] transform transition-transform duration-200 group-hover:rotate-12">{tier.icon}</span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0">
                          <span className={`text-[12px] font-bold ${tier.textColor} font-mono transition-colors duration-200`}>
                            {tier.percentage}
                          </span>
                          <h3 className={`text-[12px] font-bold ${tier.titleColor} transition-colors duration-200`}>
                            {tier.name}
                          </h3>
                        </div>
                        <p className={`text-[9.5px] ${tier.textColor} opacity-80 leading-normal transition-opacity duration-200`}>
                          {tier.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* How to increase section - Scaled up 20% */}
              <div className="mt-2.5 py-[11px] px-3 rounded-xl border border-slate-800/60 bg-slate-900/40">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-md">
                    <span className="text-white text-[8.5px]">📈</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-300">
                    Strategic Aura Enhancement:
                  </p>
                </div>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {[
                    'Create compelling content',
                    'Engage with community',
                    'Cultivate relationships',
                    'Elevate discussions'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 text-[8px] mt-0.5">💎</span>
                      <span className="text-[9.5px] text-slate-400 leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
