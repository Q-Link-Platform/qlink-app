'use client';

import React, { useState } from 'react';

export interface NotificationItem {
  id: string;
  type: 'reaction' | 'comment' | 'connection' | 'system';
  title: string;
  description: string;
  actorName?: string;
  actorHandle?: string;
  timeAgo: string;
  isRead: boolean;
}

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  onNavigateToChat?: (userHandle: string) => void;
}

export default function NotificationCenterModal({
  isOpen,
  onClose,
  currentUserId,
  onNavigateToChat,
}: NotificationCenterModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'reactions' | 'comments' | 'connections'>('all');
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'reaction',
      title: 'Post Liked',
      description: 'liked your latest post',
      actorName: 'Devanshu Suthar',
      actorHandle: 'devanshu-suthar',
      timeAgo: '12m ago',
      isRead: false,
    },
    {
      id: 'notif-2',
      type: 'connection',
      title: 'Connection Accepted',
      description: 'accepted your quantum link channel request',
      actorName: 'MR_ROHIT',
      actorHandle: 'MR_ROHIT',
      timeAgo: '1h ago',
      isRead: false,
    },
    {
      id: 'notif-3',
      type: 'comment',
      title: 'New Discussion',
      description: 'commented: "good to see you on the quantum channel"',
      actorName: 'Faren beast',
      actorHandle: 'fmjcqodn-6823',
      timeAgo: '3h ago',
      isRead: true,
    },
    {
      id: 'notif-4',
      type: 'system',
      title: 'Quantum Network Active',
      description: 'Your node is synced with 60fps glassmorphism rendering',
      timeAgo: '1d ago',
      isRead: true,
    },
  ]);

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'reactions') return n.type === 'reaction';
    if (activeTab === 'comments') return n.type === 'comment';
    if (activeTab === 'connections') return n.type === 'connection';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markSingleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-slate-700/70 bg-slate-950/90 shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">Live activity and updates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors px-2 py-1 rounded-lg hover:bg-cyan-500/10"
              >
                Mark read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 py-3 border-b border-slate-800/80 overflow-x-auto no-scrollbar text-xs">
          {[
            { key: 'all', label: 'All' },
            { key: 'reactions', label: '❤️ Reactions' },
            { key: 'comments', label: '💬 Comments' },
            { key: 'connections', label: '🔗 Connects' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1 rounded-xl font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 py-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No notifications in this category yet.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  markSingleRead(item.id);
                  if (item.actorHandle && onNavigateToChat) {
                    onNavigateToChat(item.actorHandle);
                    onClose();
                  }
                }}
                className={`flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                  item.isRead
                    ? 'hover:bg-slate-900/40 opacity-75'
                    : 'bg-cyan-950/20 border border-cyan-500/20 hover:bg-cyan-900/30'
                }`}
              >
                {/* Icon badge */}
                <div className="relative mt-0.5 flex-shrink-0">
                  <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                    {item.actorHandle ? item.actorHandle.slice(0, 2).toUpperCase() : 'QL'}
                  </div>
                  {item.type === 'reaction' && (
                    <span className="absolute -bottom-1 -right-1 text-[10px] bg-pink-600 rounded-full p-0.5 border border-slate-950">
                      ❤️
                    </span>
                  )}
                  {item.type === 'comment' && (
                    <span className="absolute -bottom-1 -right-1 text-[10px] bg-cyan-600 rounded-full p-0.5 border border-slate-950">
                      💬
                    </span>
                  )}
                  {item.type === 'connection' && (
                    <span className="absolute -bottom-1 -right-1 text-[10px] bg-purple-600 rounded-full p-0.5 border border-slate-950">
                      🔗
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs text-slate-200">
                      <strong className="font-semibold text-white">
                        {item.actorName || item.actorHandle || 'Someone'}
                      </strong>{' '}
                      {item.description}
                    </p>
                    <span className="text-[10px] text-slate-500 flex-shrink-0">{item.timeAgo}</span>
                  </div>
                  {!item.isRead && (
                    <span className="inline-block mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Real-time Connection Active</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
