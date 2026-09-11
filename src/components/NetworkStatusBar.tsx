"use client";

import React, { useEffect, useState } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

/**
 * NetworkStatusBar — Tech-giant standard ambient network status indicator.
 *
 * - Offline: Slides in from top with pulsing amber dot "Waiting for network…"
 * - Reconnected: Switches to green "Back online · Syncing…" for 2.5s, then slides out
 * - Zero blocking, zero raw error text shown to user
 * - Mounts invisibly when online — zero layout impact
 */
export function NetworkStatusBar() {
  const { isOnline, wasRecentlyOffline, offlineDuration } = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"offline" | "reconnected" | "hidden">("hidden");

  useEffect(() => {
    if (!isOnline) {
      setPhase("offline");
      setVisible(true);
    } else if (wasRecentlyOffline) {
      setPhase("reconnected");
      setVisible(true);
    } else {
      // Start exit animation
      setPhase("hidden");
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [isOnline, wasRecentlyOffline]);

  if (!visible) return null;

  const formatDuration = (secs: number) => {
    if (secs < 60) return secs > 0 ? `${secs}s` : "";
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  };

  const isHiding = phase === "hidden";

  return (
    <div
      className={`network-status-bar ${
        isHiding ? "network-status-bar--hide" : "network-status-bar--show"
      } ${phase === "reconnected" ? "network-status-bar--online" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {phase === "offline" && (
        <>
          <span className="network-status-dot network-status-dot--offline" />
          <span className="network-status-text">
            Waiting for network
            {offlineDuration > 3 && (
              <span className="network-status-duration">
                {" "}· {formatDuration(offlineDuration)}
              </span>
            )}
          </span>
        </>
      )}
      {phase === "reconnected" && (
        <>
          <span className="network-status-dot network-status-dot--online" />
          <span className="network-status-text">Back online · Syncing…</span>
        </>
      )}
    </div>
  );
}
