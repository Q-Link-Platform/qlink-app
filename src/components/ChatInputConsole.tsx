"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";

interface ChatInputConsoleProps {
  activePeerHandle: string | null;
  onSend: (text: string) => void;
  onTypingPing?: () => void;
  isUploadingAttachment: boolean;
  isRecording: boolean;
  recordingDuration: number;
  startRecording: () => void;
  stopRecording: (shouldSend: boolean) => void;
  handleAttachButtonClick: () => void;
  handleTriggerEmergencyBeacon: () => void;
  isSendingBeacon: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  videoInputRef: React.RefObject<HTMLInputElement | null>;
  imageVideoInputRef: React.RefObject<HTMLInputElement | null>;
  handleAttachmentSelected: (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "file" | "video" | "image_video"
  ) => void;
  formatDuration: (seconds: number) => string;
  editingMessage?: { id: string; content: string } | null;
  onCancelEdit?: () => void;
  isCompact?: boolean;
}

export const ChatInputConsole = memo(function ChatInputConsole({
  activePeerHandle,
  onSend,
  onTypingPing,
  isUploadingAttachment,
  isRecording,
  recordingDuration,
  startRecording,
  stopRecording,
  handleAttachButtonClick,
  handleTriggerEmergencyBeacon,
  isSendingBeacon,
  fileInputRef,
  videoInputRef,
  imageVideoInputRef,
  handleAttachmentSelected,
  formatDuration,
  editingMessage = null,
  onCancelEdit,
  isCompact = false,
}: ChatInputConsoleProps) {
  const [localInput, setLocalInput] = useState("");
  const [showMobileChatMore, setShowMobileChatMore] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced typing notification trigger
  const triggerTyping = useCallback(() => {
    if (!onTypingPing) return;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      onTypingPing();
    }, 250);
  }, [onTypingPing]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalInput(val);
    triggerTyping();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = localInput.trim();
    if (!text || !activePeerHandle) return;

    // Reset local input instantly for 0ms latency feel
    setLocalInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Execute send callback
    onSend(text);
  };

  useEffect(() => {
    if (editingMessage) {
      setLocalInput(editingMessage.content);
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = editingMessage.content.length;
        textareaRef.current.selectionEnd = editingMessage.content.length;
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    }
  }, [editingMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape" && editingMessage) {
      e.preventDefault();
      onCancelEdit?.();
      setLocalInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Clean up typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-1.5 pt-0 relative z-[9999] w-full"
    >
      {/* WhatsApp-standard Editing Message Floating Top Banner */}
      {editingMessage && (
        <div className="absolute -top-9 left-0 right-0 z-30 flex items-center justify-between rounded-t-2xl border-t border-x border-cyan-500/40 bg-gradient-to-r from-cyan-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-2xl px-3.5 py-1.5 text-[11px] shadow-[0_-5px_20px_rgba(6,182,212,0.25)] animate-fade-in">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <svg className="h-3.5 w-3.5 text-cyan-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            <span className="font-bold text-cyan-300 shrink-0">Editing Message:</span>
            <span className="truncate text-slate-300 font-mono text-[10px]">{editingMessage.content}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onCancelEdit?.();
              setLocalInput("");
              if (textareaRef.current) textareaRef.current.style.height = "auto";
            }}
            className="rounded-full p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
            title="Cancel Edit (Esc)"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        className="hidden"
        onChange={(e) => handleAttachmentSelected(e, "file")}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleAttachmentSelected(e, "video")}
      />
      <input
        ref={imageVideoInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleAttachmentSelected(e, "image_video")}
      />

      {isRecording ? (
        <div className="flex-1 flex items-center justify-between rounded-xl border border-rose-500/40 bg-[#09111c]/90 px-3 py-1.5 backdrop-blur-md animate-float-in h-9 sm:h-10">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400 ml-1">
              Recording Voice
            </span>
            <span className="text-xs font-semibold text-slate-200 font-mono ml-1">
              {formatDuration(recordingDuration)}
            </span>
          </div>

          {/* Soundwave visualizer */}
          <div className="flex items-end gap-0.5 h-4 px-2">
            <span className="w-0.5 bg-cyan-400 rounded-full animate-cyberwave-1 origin-bottom h-3" />
            <span className="w-0.5 bg-cyan-400 rounded-full animate-cyberwave-2 origin-bottom h-4" />
            <span className="w-0.5 bg-cyan-500 rounded-full animate-cyberwave-3 origin-bottom h-2.5" />
            <span className="w-0.5 bg-blue-400 rounded-full animate-cyberwave-4 origin-bottom h-5" />
            <span className="w-0.5 bg-blue-500 rounded-full animate-cyberwave-5 origin-bottom h-3.5" />
            <span className="w-0.5 bg-purple-400 rounded-full animate-cyberwave-1 origin-bottom h-4" />
            <span className="w-0.5 bg-purple-500 rounded-full animate-cyberwave-2 origin-bottom h-2" />
          </div>

          {/* Recording Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => stopRecording(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-red-500/40 bg-red-950/80 hover:bg-red-900/90 text-red-400 hover:text-red-300 hover:border-red-400/80 transition-all shadow-[0_0_8px_rgba(239,68,68,0.2)]"
              title="Cancel Recording"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => stopRecording(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/80 bg-gradient-to-tr from-cyan-400 via-sky-400 to-fuchsia-400 text-slate-950 font-bold hover:brightness-110 transition-all shadow-[0_0_8px_rgba(34,211,238,0.5)]"
              title="Send Voice Message"
            >
              <svg className="h-3.5 w-3.5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Action Group */}
          <div className="hidden sm:flex items-center gap-1 shrink-0 z-[9999]">
            {/* Paperclip Button */}
            <div className="paperclip-container relative">
              <button
                type="button"
                disabled={!activePeerHandle}
                onClick={handleAttachButtonClick}
                className="select-none flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-600/50 bg-[#09111c]/95 text-slate-300 drop-shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-slate-800 hover:text-cyan-300 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {isUploadingAttachment ? (
                  <svg className="h-4 w-4 animate-spin text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)] pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4 sm:h-5 sm:w-5 pointer-events-none"
                    style={{ transform: "rotate(-45deg)" }}
                  >
                    <path
                      d="M8.5 11.75 13 7.25a2.5 2.5 0 1 1 3.54 3.54l-6.01 6.01a3.75 3.75 0 0 1-5.3-5.3l5.13-5.13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Mic Button */}
            <div className="mic-container relative">
              <button
                type="button"
                disabled={!activePeerHandle || isUploadingAttachment}
                onClick={startRecording}
                className="select-none flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-600/50 bg-[#09111c]/95 text-slate-300 drop-shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-slate-800 hover:text-cyan-300 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Actions Control */}
          <div className={`relative ${isCompact ? "flex" : "flex sm:hidden"}`}>
            {showMobileChatMore && (
              <div className="absolute bottom-[calc(100%+0.5rem)] left-0 z-[9999] flex flex-col items-center gap-3 p-3 rounded-2xl border border-cyan-500/40 bg-[#09111c]/95 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.35)] animate-float-in min-w-[3.5rem]">
                <div className="flex flex-col items-center gap-0.5">
                  <button
                    type="button"
                    disabled={!activePeerHandle}
                    onClick={() => {
                      handleAttachButtonClick();
                      setShowMobileChatMore(false);
                    }}
                    className="select-none flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/50 bg-[#09111c]/95 text-slate-300 drop-shadow-md transition-all duration-200 hover:border-cyan-400/50 hover:bg-slate-800 hover:text-cyan-300 active:scale-95 disabled:opacity-40"
                  >
                    {isUploadingAttachment ? (
                      <svg className="h-4 w-4 animate-spin text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)] pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-4 w-4 pointer-events-none"
                        style={{ transform: "rotate(-45deg)" }}
                      >
                        <path
                          d="M8.5 11.75 13 7.25a2.5 2.5 0 1 1 3.54 3.54l-6.01 6.01a3.75 3.75 0 0 1-5.3-5.3l5.13-5.13"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">File</span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <button
                    type="button"
                    disabled={!activePeerHandle || isUploadingAttachment}
                    onClick={() => {
                      startRecording();
                      setShowMobileChatMore(false);
                    }}
                    className="select-none flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/50 bg-[#09111c]/95 text-slate-300 drop-shadow-md transition-all duration-200 hover:border-cyan-400/50 hover:bg-slate-800 hover:text-cyan-300 active:scale-95 disabled:opacity-40"
                  >
                    <svg className="h-4 w-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Voice</span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <button
                    type="button"
                    disabled={!activePeerHandle || isSendingBeacon}
                    onClick={() => {
                      handleTriggerEmergencyBeacon();
                      setShowMobileChatMore(false);
                    }}
                    title="⚡ Send Priority Emergency Beacon (Bypasses DND)"
                    className="select-none flex h-9 w-9 items-center justify-center rounded-full border border-rose-500/80 bg-rose-600/90 text-xs font-bold text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] transition hover:bg-rose-500 active:scale-95 disabled:opacity-40"
                  >
                    ⚡
                  </button>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-rose-300">Beacon</span>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!activePeerHandle}
              onClick={() => setShowMobileChatMore((prev) => !prev)}
              title="More Actions"
              className={`select-none flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-slate-200 transition-all duration-200 active:scale-95 disabled:opacity-40 ${
                showMobileChatMore
                  ? "border-cyan-400 bg-slate-800 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                  : "border-slate-600/60 bg-[#09111c]/95 hover:border-cyan-400/50 hover:bg-slate-800 hover:text-cyan-300"
              }`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>

          {/* Local Textarea Input */}
          <div className="relative flex-1 group">
            <textarea
              ref={textareaRef}
              rows={1}
              value={localInput}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={!activePeerHandle}
              className="min-h-[36px] max-h-24 sm:max-h-32 w-full resize-none rounded-xl border border-slate-600/70 bg-slate-950/70 pl-3 pr-3 py-1.5 text-xs text-slate-100 outline-none ring-0 transition focus:border-cyan-400 focus:bg-slate-950 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.6)] sm:text-sm disabled:opacity-50"
              placeholder={
                activePeerHandle
                  ? `Type a message to @${activePeerHandle}…`
                  : "Accept a request to start chatting…"
              }
            />
          </div>

          {/* Q-BEACON Desktop Emergency Button */}
          <button
            type="button"
            disabled={!activePeerHandle || isSendingBeacon}
            onClick={handleTriggerEmergencyBeacon}
            title="⚡ Send Priority Emergency Beacon (Bypasses DND)"
            className="select-none hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-500/80 bg-rose-600/90 text-xs font-bold text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] transition hover:bg-rose-500 active:scale-95 sm:h-10 sm:w-10 disabled:opacity-40"
          >
            ⚡
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!activePeerHandle || !localInput.trim()}
            className="select-none inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/80 bg-gradient-to-tr from-cyan-400 via-sky-400 to-fuchsia-400 text-xs font-medium text-slate-950 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] [clip-path:circle(50%)] transition hover:brightness-110 sm:h-10 sm:w-10 disabled:opacity-50"
          >
            <span className="send-arrow text-base leading-none text-slate-950">
              ↑
            </span>
          </button>
        </>
      )}
    </form>
  );
});
