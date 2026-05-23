'use client';

import React from 'react';
import { useAutoReload } from './AutoReloadProvider';

export default function AutoReloadStatus() {
  const { isEnabled, status, currentProblem, metrics, enable, disable, forceRecovery } = useAutoReload();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'recovering': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      case 'detecting': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'recovering': return '🔄';
      case 'failed': return '❌';
      case 'detecting': return '🔍';
      default: return '⚡';
    }
  };

  const getProblemIcon = (problem: string) => {
    switch (problem) {
      case 'database_loading': return '🗄️';
      case 'browser_ui_fail': return '🎨';
      case 'app_infrastructure': return '🏗️';
      case 'network_connectivity': return '🌐';
      case 'system_overload': return '💻';
      default: return '⚠️';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900/95 border border-slate-700/60 rounded-2xl p-4 shadow-lg z-50 max-w-sm">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span className="text-cyan-400">🚀</span>
            Auto-Reload System
          </h3>
          <button
            onClick={isEnabled ? disable : enable}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              isEnabled 
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
            }`}
          >
            {isEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Status:</span>
          <span className={`text-xs font-bold ${getStatusColor(status)}`}>
            {getStatusIcon(status)} {status.toUpperCase()}
          </span>
        </div>

        {/* Current Problem */}
        {currentProblem && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Problem:</span>
            <span className="text-xs font-medium text-orange-400">
              {getProblemIcon(currentProblem)} {currentProblem.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        )}

        {/* Metrics */}
        {metrics && (
          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Total Attempts:</span>
              <span className="font-medium">{metrics.totalAttempts}</span>
            </div>
            <div className="flex justify-between">
              <span>Success Rate:</span>
              <span className="font-medium text-green-400">
                {metrics.totalAttempts > 0 
                  ? Math.round((metrics.successfulRecoveries / metrics.totalAttempts) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Recovery Time:</span>
              <span className="font-medium">{Math.round(metrics.averageRecoveryTime)}ms</span>
            </div>
          </div>
        )}

        {/* Manual Recovery */}
        <div className="pt-2 border-t border-slate-700/60">
          <button
            onClick={() => forceRecovery('Manual recovery test')}
            className="w-full py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded text-xs font-medium transition-colors"
          >
            🔄 Test Recovery
          </button>
        </div>

        {/* Health Status */}
        <div className="text-xs text-slate-500 text-center">
          {isEnabled ? '🟢 System is monitoring and auto-recovering' : '🔴 System is disabled'}
        </div>
      </div>
    </div>
  );
}
