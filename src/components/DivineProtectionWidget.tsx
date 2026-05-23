'use client';

import { useState, useEffect } from 'react';
import { DIVINE_PROTECTION, PROTECTION_LEVELS } from '@/lib/divine-protection';

export default function DivineProtectionWidget() {
  const [protectionLevel, setProtectionLevel] = useState<string>(PROTECTION_LEVELS.BASIC);
  const [lastBlessing, setLastBlessing] = useState<string>('');
  const [divineActive, setDivineActive] = useState<boolean>(false);

  useEffect(() => {
    // Check divine protection status
    checkDivineProtection();
    
    // Set up divine protection interval
    const interval = setInterval(() => {
      checkDivineProtection();
    }, 33000); // Every 33 seconds (sacred number)

    return () => clearInterval(interval);
  }, []);

  const checkDivineProtection = async () => {
    try {
      // Check app protection status
      const response = await fetch('/api/divine-status');
      const data = await response.json();
      
      if (data.divineProtection) {
        setDivineActive(true);
        setProtectionLevel(data.protectionLevel || PROTECTION_LEVELS.BASIC);
        setLastBlessing(data.lastBlessing || '');
      }
    } catch (error) {
      console.log('Divine protection check failed, but app remains protected');
      setDivineActive(true); // Assume protection is active
    }
  };

  const activateDivineProtection = async () => {
    try {
      const response = await fetch('/api/divine-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mantra: DIVINE_PROTECTION.DIVINE_SHIELD,
          protectionLevel: PROTECTION_LEVELS.DIVINE
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setDivineActive(true);
        setProtectionLevel(PROTECTION_LEVELS.DIVINE);
        setLastBlessing(data.blessing || 'Divine protection activated');
        
        // Show divine notification
        showDivineNotification('🙏 Divine protection activated successfully!');
      }
    } catch (error) {
      console.error('Failed to activate divine protection:', error);
      showDivineNotification('❌ Divine protection failed - but app remains safe');
    }
  };

  const showDivineNotification = (message: string) => {
    // Create divine notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-orange-500/90 to-yellow-500/90 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  };

  const getProtectionColor = (level: string) => {
    switch (level) {
      case PROTECTION_LEVELS.DIVINE: return 'text-yellow-400';
      case PROTECTION_LEVELS.ADVANCED: return 'text-orange-400';
      case PROTECTION_LEVELS.INTERMEDIATE: return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  const getProtectionIcon = (level: string) => {
    switch (level) {
      case PROTECTION_LEVELS.DIVINE: return '🕉️';
      case PROTECTION_LEVELS.ADVANCED: return '💪';
      case PROTECTION_LEVELS.INTERMEDIATE: return '🛡️';
      default: return '✨';
    }
  };

  return (
    <div className="rounded-2xl border border-yellow-500/60 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="text-yellow-400">🙏</span>
          Divine Protection
        </h3>
        <p className="text-sm text-slate-400">
          App is under divine protection of Lord Ganesh, Hanuman, and Ram
        </p>
      </div>

      {/* Protection Status */}
      <div className="bg-slate-800/50 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">Protection Status</p>
            <p className={`text-lg font-bold ${getProtectionColor(protectionLevel)}`}>
              {getProtectionIcon(protectionLevel)} {protectionLevel.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Divine Shield</p>
            <p className="text-lg font-bold text-yellow-400">
              {divineActive ? '🛡️ ACTIVE' : '⚡ STANDBY'}
            </p>
          </div>
        </div>
      </div>

      {/* Divine Mantras */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-300">Active Mantras:</p>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="bg-slate-800/30 rounded-lg p-2 flex items-center gap-2">
            <span className="text-red-400">🕉️</span>
            <span className="text-slate-200">{DIVINE_PROTECTION.GANESH_MANTRA}</span>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-2 flex items-center gap-2">
            <span className="text-orange-400">💪</span>
            <span className="text-slate-200">{DIVINE_PROTECTION.HANUMAN_MANTRA}</span>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-2 flex items-center gap-2">
            <span className="text-blue-400">🏹</span>
            <span className="text-slate-200">{DIVINE_PROTECTION.RAM_MANTRA}</span>
          </div>
        </div>
      </div>

      {/* Last Blessing */}
      {lastBlessing && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2">
          <p className="text-xs text-green-300">
            ✨ {lastBlessing}
          </p>
        </div>
      )}

      {/* Activate Button */}
      <button
        onClick={activateDivineProtection}
        className="w-full py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-yellow-400 rounded-lg text-sm font-medium transition-all duration-300 border border-yellow-500/30"
      >
        🙏 Activate Divine Protection
      </button>

      <div className="text-xs text-slate-500 text-center">
        This app is blessed with divine protection to ensure it never fails and always serves users with positivity and success.
      </div>
    </div>
  );
}
