"use client";

import React, { useEffect } from "react";
import { quantumAudio } from "@/lib/quantumAudio";

interface EmergencyBeaconModalProps {
  senderHandle: string;
  senderName?: string;
  senderImage?: string | null;
  voiceUrl?: string | null;
  noteText?: string | null;
  onClose: () => void;
  onAcknowledge: () => void;
}

export const EmergencyBeaconModal: React.FC<EmergencyBeaconModalProps> = ({
  senderHandle,
  senderName,
  senderImage,
  voiceUrl,
  noteText,
  onClose,
  onAcknowledge,
}) => {
  useEffect(() => {
    // Play dual-tone frequency sweep & voice audio snippet
    if (voiceUrl) {
      quantumAudio.playVoiceSnippet(voiceUrl);
    } else {
      quantumAudio.playEmergencyChime();
    }
  }, [voiceUrl]);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 transition-all animate-in fade-in duration-300">
      {/* Crimson Radar Pulsing Glow Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-rose-600/20 blur-[120px] animate-pulse" />
        <div className="absolute h-[350px] w-[350px] rounded-full border border-rose-500/30 animate-ping duration-1000" />
        <div className="absolute h-[500px] w-[500px] rounded-full border border-rose-500/20 animate-ping duration-1000 delay-300" />
      </div>

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/40 bg-slate-900/90 p-6 text-center shadow-[0_0_50px_rgba(244,63,94,0.4)] backdrop-blur-2xl sm:p-8">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/50 bg-rose-950/60 px-4 py-1.5 text-xs font-semibold text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
          </span>
          ⚡ PRIORITY EMERGENCY BEACON
        </div>

        {/* Sender Avatar */}
        <div className="relative mx-auto my-6 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-rose-500/30 blur-md animate-pulse" />
          {senderImage ? (
            <img
              src={senderImage}
              alt={senderHandle}
              className="relative h-24 w-24 rounded-full border-2 border-rose-400 object-cover shadow-lg"
            />
          ) : (
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-rose-400 bg-rose-950 font-mono text-3xl font-bold text-rose-200">
              {senderHandle[0]?.toUpperCase() || "Q"}
            </div>
          )}
        </div>

        {/* Sender Title */}
        <h3 className="text-xl font-bold text-slate-100 sm:text-2xl">
          {senderName || `@${senderHandle}`}
        </h3>
        <p className="mt-1 font-mono text-sm text-rose-400">@{senderHandle}</p>

        {/* Voice Note / Waveform Visualizer */}
        <div className="my-6 rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-300">
            {voiceUrl ? "🎙️ Playing Urgent Voice Flash" : "🚨 Urgent Beacon Message"}
          </p>

          {/* Animated Audio Waveform */}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <span className="h-6 w-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-10 w-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-14 w-1.5 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: "300ms" }} />
            <span className="h-8 w-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "450ms" }} />
            <span className="h-12 w-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: "200ms" }} />
          </div>

          {noteText && (
            <p className="mt-3 text-sm italic text-slate-200">"{noteText}"</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              quantumAudio.warmup();
              quantumAudio.playEmergencyChime();
            }}
            className="w-full rounded-2xl border border-rose-500/50 bg-rose-950/80 py-3 text-xs font-semibold text-rose-200 transition-all hover:bg-rose-900 active:scale-95"
          >
            🔊 Replay Loud Alarm Sound
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              onAcknowledge();
              onClose();
            }}
            className="w-full rounded-2xl border border-emerald-500/50 bg-emerald-600/90 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:bg-emerald-500 active:scale-95"
          >
            🟢 I'm Awake / Got It
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 py-3.5 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-700 active:scale-95"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
