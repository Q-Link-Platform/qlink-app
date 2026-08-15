"use client";

import React from "react";

export type MessageStatus = "SENT" | "DELIVERED" | "READ" | string;

interface MessageStatusTicksProps {
  status?: MessageStatus;
  isMe?: boolean;
  className?: string;
}

/**
 * Reusable WhatsApp-style Message Status Indicator Component.
 * - Single Grey Tick (✓): Message sent to server (SENT).
 * - Double Grey Tick (✓✓): Message delivered to recipient's device (DELIVERED).
 * - Double Green Tick (✓✓ in Emerald/Green): Message seen/read by recipient in active chat window (READ).
 *
 * Positioned 2% lower and sized up for high visibility and crisp legibility.
 */
export const MessageStatusTicks: React.FC<MessageStatusTicksProps> = ({
  status = "SENT",
  isMe = true,
  className = "",
}) => {
  // Ticks are only rendered for outgoing messages sent by the current user
  if (!isMe) return null;

  const normalizedStatus = typeof status === "string" ? status.toUpperCase() : "SENT";

  // Double Green Tick (READ)
  if (normalizedStatus === "READ") {
    return (
      <span
        className={`inline-flex items-center text-emerald-400 font-bold ml-1.5 align-middle relative top-[1px] translate-y-[1px] transition-all duration-300 ${className}`}
        title="Seen / Read by user"
      >
        <svg
          className="w-[16.5px] h-[16.5px] fill-current drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]"
          viewBox="0 0 24 24"
        >
          {/* Double tick path */}
          <path d="M0.41 13.41L6 19L7.41 17.58L1.83 12M22.24 5.58L11.66 16.17L7.5 12L6.07 13.41L11.66 19L23.66 7M18 7L16.59 5.58L10.25 11.92L11.66 13.33L18 7Z" />
        </svg>
      </span>
    );
  }

  // Double Grey Tick (DELIVERED)
  if (normalizedStatus === "DELIVERED") {
    return (
      <span
        className={`inline-flex items-center text-slate-400/90 font-medium ml-1.5 align-middle relative top-[1px] translate-y-[1px] transition-all duration-200 ${className}`}
        title="Delivered to device"
      >
        <svg
          className="w-[16.5px] h-[16.5px] fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M0.41 13.41L6 19L7.41 17.58L1.83 12M22.24 5.58L11.66 16.17L7.5 12L6.07 13.41L11.66 19L23.66 7M18 7L16.59 5.58L10.25 11.92L11.66 13.33L18 7Z" />
        </svg>
      </span>
    );
  }

  // Single Grey Tick (SENT / Default)
  return (
    <span
      className={`inline-flex items-center text-slate-400/90 font-medium ml-1.5 align-middle relative top-[1px] translate-y-[1px] transition-all duration-200 ${className}`}
      title="Sent to server"
    >
      <svg
        className="w-[14.5px] h-[14.5px] fill-current"
        viewBox="0 0 24 24"
      >
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    </span>
  );
};
