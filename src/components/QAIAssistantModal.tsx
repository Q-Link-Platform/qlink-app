"use client";

import React, { useState, useRef, useEffect } from "react";
import { AIMode, PolishStyle, QAIMessage, streamQAIResponse } from "@/lib/qai-engine";
import { qaiActionBus, QAIToolAction } from "@/lib/qai-tools";

export interface RawChatMessageItem {
  id?: string;
  content: string;
  senderId: string;
  createdAt?: string;
}

interface QAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToChat?: (text: string) => void;
  activeDraftText?: string;
  activePeerHandle?: string | null;
  rawChatMessages?: RawChatMessageItem[];
  meId?: string;
}

export default function QAIAssistantModal({
  isOpen,
  onClose,
  onInsertToChat,
  activeDraftText = "",
  activePeerHandle = null,
  rawChatMessages = [],
  meId = "",
}: QAIAssistantModalProps) {
  const [mode, setMode] = useState<AIMode>("general");
  const [polishStyle, setPolishStyle] = useState<PolishStyle>("professional");
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<QAIMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "👋 **Q-AI Assistant is active.**\n\nI'm docked beside your active chat. Ask me anything, polish draft messages, or let me assist your conversation with autonomous intelligence!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mode: "general",
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);
  const [scheduledStatusMap, setScheduledStatusMap] = useState<Record<string, "PENDING" | "SCHEDULED" | "ERROR" | "CANCELLED">>({});
  const handleCancelSchedule = async (msgId: string) => {
    try {
      setScheduledStatusMap((prev) => ({ ...prev, [msgId]: "CANCELLED" as any }));
    } catch (e) {
      console.error("Cancel schedule error:", e);
    }
  };

  const handleExecuteSchedule = async (msgId: string, actionData: { target: string; text: string; minutesFromNow?: number; timeDescription?: string }) => {
    try {
      const minutes = actionData.minutesFromNow || 5;
      const executeDate = new Date(Date.now() + minutes * 60 * 1000);
      const targetHandle = actionData.target || activePeerHandle || "";

      const res = await fetch("/api/chat/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientHandle: targetHandle,
          content: actionData.text,
          executeAt: executeDate.toISOString(),
        }),
      });

      if (res.ok) {
        setScheduledStatusMap((prev) => ({ ...prev, [msgId]: "SCHEDULED" }));
      } else {
        setScheduledStatusMap((prev) => ({ ...prev, [msgId]: "ERROR" }));
      }
    } catch (e) {
      console.error("Schedule error:", e);
      setScheduledStatusMap((prev) => ({ ...prev, [msgId]: "ERROR" }));
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll within the messages container only
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Context-Aware Friend Agent Memory Extractor
  const extractFriendContext = (query: string) => {
    if (!activePeerHandle || !Array.isArray(rawChatMessages) || rawChatMessages.length === 0) {
      return null;
    }

    const qLower = query.toLowerCase();
    const hasTimeOrHistoryHint =
      /(\byesterday\b|\btoday\b|\blast\s+(week|night|month)|\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b|\b\d{1,2}(:\d{2})?\s*(am|pm)\b|\bwhen\b|\btime\b|\bdate\b|\bday\b|\bearlier\b|\bbefore\b|\bremember\b|\bsaid\b)/i.test(
        qLower
      );

    let selectedMessages: RawChatMessageItem[] = [];

    if (hasTimeOrHistoryHint && rawChatMessages.length > 8) {
      const matching = rawChatMessages.filter((m) => {
        const textLower = (m.content || "").toLowerCase();
        return (
          qLower.split(/\s+/).some((w) => w.length > 3 && textLower.includes(w)) ||
          /(\bmeeting\b|\bcall\b|\blink\b|\bcode\b|\btime\b|\bfriday\b|\btomorrow\b)/i.test(textLower)
        );
      });
      const combinedSet = new Set([...matching.slice(-6), ...rawChatMessages.slice(-4)]);
      selectedMessages = Array.from(combinedSet);
    } else {
      selectedMessages = rawChatMessages.slice(-8);
    }

    return {
      friendHandle: activePeerHandle,
      recentMessages: selectedMessages.map((m) => ({
        sender: (m.senderId === meId ? "user" : "friend") as "user" | "friend",
        text: m.content,
        timestamp: m.createdAt
          ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : undefined,
      })),
    };
  };

  // Intelligent AI Draft Message Extraction Agent
  const extractDraftOptions = (raw: string): string[] => {
    if (!raw) return [];

    // 1. Look for markdown blockquotes (> ...)
    const blockquotes: string[] = [];
    const bqMatches = raw.match(/(?:^|\n)>\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/g);
    if (bqMatches) {
      for (const b of bqMatches) {
        let clean = b.replace(/(?:^|\n)>\s*/g, "\n").trim();
        clean = clean.replace(/^["'“]|["'”]$/g, "").trim();
        if (clean.length > 3 && !clean.toLowerCase().startsWith("note:")) {
          blockquotes.push(clean);
        }
      }
    }
    if (blockquotes.length > 0) return blockquotes;

    // 2. Look for double-quoted message candidates
    const quoteMatches = raw.match(/["“]([^"”\n]{8,})["”]/g);
    if (quoteMatches) {
      const cleanedQ = quoteMatches
        .map((q) => q.replace(/^["“]|["”]$/g, "").trim())
        .filter((q) => !q.toLowerCase().startsWith("here is"));
      if (cleanedQ.length > 0) return cleanedQ;
    }

    // 3. Fallback: Strip introductory AI conversational fluff
    const lines = raw.trim().split("\n");
    const filtered: string[] = [];
    for (const line of lines) {
      const l = line.trim();
      if (/^(here('s| is)|you can (say|send|reply)|alternatively|hope this|let me know|option \d|feel free|\*|\#)/i.test(l)) {
        continue;
      }
      if (l) filtered.push(l);
    }

    const fallback = filtered.join("\n").trim();
    return [fallback || raw.trim()];
  };

  if (!isOpen) return null;

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || inputQuery;
    if (!textToSend.trim() || isGenerating) return;

    const userMsg: QAIMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mode,
    };

    const assistantMsgId = `ai-${Date.now()}`;
    const assistantPlaceholder: QAIMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mode,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setInputQuery("");
    setIsGenerating(true);

    try {
      let accumulated = "";
      const friendCtx = extractFriendContext(textToSend);
      for await (const chunk of streamQAIResponse(textToSend, mode, polishStyle, messages, friendCtx)) {
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: accumulated } : m))
        );
      }

      // --- AGENTIC AUTONOMOUS AUTO-INSERTION AGENT ---
      // Automatically selects the best draft and inserts it directly into the chat composer
      const isDraftOrReply =
        mode === "polish" ||
        /(\breply\b|\bdraft\b|\bsuggest\b|\bwrite\b|\bmessage\b|\bwhat (should|can) i say\b|\btell (him|her|them)\b|\banswer\b)/i.test(
          textToSend
        );

      if (isDraftOrReply && onInsertToChat) {
        const drafts = extractDraftOptions(accumulated);
        if (drafts.length > 0 && drafts[0].trim().length > 0) {
          const autoSelectedDraft = drafts[0]
            .replace(/^\s*>\s*/gm, "")
            .replace(/^["'“]|["'”]$/g, "")
            .trim();
          onInsertToChat(autoSelectedDraft);
          setInsertedId(assistantMsgId);
          setTimeout(() => setInsertedId(null), 3000);
        }
      }

      // --- FULL APP CONTROL SWARM ACTION DISPATCHER (<qai_action>) ---
      const qaiActionMatch = accumulated.match(/<qai_action>([\s\S]*?)<\/qai_action>/);
      if (qaiActionMatch) {
        try {
          const actionPayload: QAIToolAction = JSON.parse(qaiActionMatch[1].trim());
          qaiActionBus.dispatch(actionPayload);
          
          if (actionPayload.tool === "schedule_message") {
            await handleExecuteSchedule(assistantMsgId, actionPayload.params);
          }
        } catch (e) {
          console.error("QAI Action dispatch error:", e);
        }
      }

      // Legacy fallback: <schedule_action>
      const scheduleMatch = accumulated.match(/<schedule_action>([\s\S]*?)<\/schedule_action>/);
      if (scheduleMatch && !qaiActionMatch) {
        try {
          const scheduleData = JSON.parse(scheduleMatch[1].trim());
          await handleExecuteSchedule(assistantMsgId, scheduleData);
        } catch (e) {
          console.error("Auto schedule execution error:", e);
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: "⚠️ An error occurred while generating response. Please try again." }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, isStreaming: false } : m))
      );
    }
  };

  const handleCopy = (id: string, text: string) => {
    const clean = text.replace(/^[>#*\-]+\s*/gm, "").trim();
    navigator.clipboard.writeText(clean);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsert = (msgId: string, rawContent: string, specificOption?: string) => {
    let textToInsert = specificOption;
    if (!textToInsert) {
      const options = extractDraftOptions(rawContent);
      textToInsert = options[0] || rawContent;
    }
    // Clean text thoroughly
    textToInsert = textToInsert
      .replace(/^\s*>\s*/gm, "")
      .replace(/^["'“]|["'”]$/g, "")
      .trim();

    if (onInsertToChat) {
      onInsertToChat(textToInsert);
    }
    setInsertedId(msgId);
    setTimeout(() => setInsertedId(null), 2500);
  };

  // Quick Action Chips
  const quickPrompts = [
    { label: "✍️ Polish Draft", action: () => { setMode("polish"); if (activeDraftText) handleSend(activeDraftText); } },
    { label: "💬 Auto-Reply Friend", action: () => { setMode("general"); handleSend(`Suggest a smart, friendly reply to my friend based on our last messages.`); } },
    { label: "💎 Quantum Points", action: () => { setMode("qlink"); handleSend("How do I earn Quantum Points and boost my Aura?"); } },
    { label: "🔐 E2EE Security", action: () => { setMode("qlink"); handleSend("Explain Q-Link cryptographic architecture"); } },
  ];

  return (
    /* Integrated In-Chat 360px Sidecar Panel (Contained, Zero Page Scrolling) */
    <div className="absolute right-0 top-0 bottom-0 z-[60] flex w-full sm:w-[360px] h-full flex-col border-l border-cyan-500/35 bg-slate-950/95 shadow-[-16px_0_40px_rgba(0,0,0,0.85),-2px_0_15px_rgba(6,182,212,0.2)] backdrop-blur-3xl transition-all duration-300 ease-out animate-slide-left overflow-hidden">
      
      {/* Specular Ambient Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-10 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />

      {/* Docked In-Chat Header */}
      <div className="relative z-10 shrink-0 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-3.5 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="relative flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 via-sky-600/10 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            <div className={`h-1.5 w-1.5 rounded-full bg-cyan-400 ${isGenerating ? "animate-ping" : "animate-pulse"}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">
                Q-AI Copilot
              </h3>
              {activePeerHandle && (
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.2 text-[8px] font-mono font-semibold text-cyan-300">
                  @{activePeerHandle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Close Sidecar Button */}
        <button
          id="qai-sidecar-close-btn"
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          title="Close AI Sidecar"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mode Selector */}
      <div className="relative z-10 shrink-0 flex items-center justify-between border-b border-white/5 bg-slate-950/50 px-3 py-1 text-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode("general")}
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-all duration-200 ${
              mode === "general"
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            💡 General
          </button>
          <button
            type="button"
            onClick={() => setMode("polish")}
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-all duration-200 ${
              mode === "polish"
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            ✍️ Polish
          </button>
          <button
            type="button"
            onClick={() => setMode("qlink")}
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-all duration-200 ${
              mode === "qlink"
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            🛡️ Info
          </button>
        </div>

        {mode === "polish" && (
          <select
            value={polishStyle}
            onChange={(e) => setPolishStyle(e.target.value as PolishStyle)}
            className="rounded border border-cyan-500/30 bg-slate-900 px-1 py-0.5 text-[9px] text-cyan-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="professional">Professional</option>
            <option value="witty">Witty</option>
            <option value="concise">Concise</option>
            <option value="persuasive">Persuasive</option>
            <option value="cyberpunk">Cyberpunk</option>
          </select>
        )}
      </div>

      {/* Message List (Strictly Contained, Scrolls Independently) */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 scrollbar-hide">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center gap-1 mb-0.5 px-1">
              <span className="text-[9px] font-mono text-slate-500">
                {m.role === "user" ? "You" : "Q-AI"}
              </span>
              <span className="text-[8px] font-mono text-slate-600">{m.timestamp}</span>
            </div>

            <div
              className={`relative max-w-[94%] rounded-xl px-3 py-2 text-[11px] leading-relaxed transition-all duration-200 ${
                m.role === "user"
                  ? "border border-cyan-500/30 bg-gradient-to-r from-cyan-950/70 to-slate-900/80 text-cyan-100 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                  : "border border-white/10 bg-slate-900/85 text-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.4)] backdrop-blur-xl"
              }`}
            >
              <div className="whitespace-pre-wrap space-y-1">
                {(() => {
                  if (!m.content) {
                    return (
                      <span className="inline-flex items-center gap-1 text-cyan-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Thinking...
                      </span>
                    );
                  }

                  // Parse <qai_action> and <schedule_action>
                  const qaiActionMatch = m.content.match(/<qai_action>([\s\S]*?)<\/qai_action>/);
                  let parsedAction: QAIToolAction | null = null;
                  if (qaiActionMatch) {
                    try { parsedAction = JSON.parse(qaiActionMatch[1].trim()); } catch {}
                  }

                  const scheduleMatch = m.content.match(/<schedule_action>([\s\S]*?)<\/schedule_action>/);
                  const cleanDisplayContent = m.content
                    .replace(/<qai_action>[\s\S]*?<\/qai_action>/g, "")
                    .replace(/<schedule_action>[\s\S]*?<\/schedule_action>/g, "")
                    .trim();

                  let scheduleData: { target: string; text: string; minutesFromNow?: number; timeDescription?: string } | null = null;
                  if (scheduleMatch) {
                    try {
                      scheduleData = JSON.parse(scheduleMatch[1].trim());
                    } catch {}
                  }

                  const schedStatus = scheduledStatusMap[m.id];

                  return (
                    <>
                      <div>{cleanDisplayContent}</div>

                      {parsedAction && !m.isStreaming && parsedAction.tool !== "schedule_message" && (
                        <div className="mt-2 flex items-center justify-between rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 to-slate-900/90 px-3 py-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)] backdrop-blur-xl text-[10px]">
                          <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                            <span>⚡ Action Executed:</span>
                            <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 font-mono text-cyan-200 uppercase">
                              {parsedAction.tool.replace(/_/g, " ")}
                            </span>
                          </div>
                          <span className="font-medium text-slate-400 italic">0ms React Dispatch</span>
                        </div>
                      )}

                      {scheduleData && !m.isStreaming && (
                        <div className="mt-2 rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 to-slate-900/90 p-2.5 shadow-[0_0_15px_rgba(245,158,11,0.15)] backdrop-blur-xl">
                          <div className="flex items-center justify-between gap-1 text-[10px]">
                            <div className="flex items-center gap-1 font-bold text-amber-300">
                              <span>⏰ Scheduled Message</span>
                              <span className="rounded bg-amber-500/20 px-1 py-0.2 font-mono text-[9px] text-amber-200">
                                {scheduleData.timeDescription || `In ${scheduleData.minutesFromNow || 5} mins`}
                              </span>
                            </div>
                            <span className="font-mono text-[9px] text-slate-400">
                              To: {scheduleData.target || `@${activePeerHandle}`}
                            </span>
                          </div>

                          <div className="mt-1.5 rounded-lg border border-white/10 bg-black/40 p-1.5 text-[10px] italic text-slate-200">
                            "{scheduleData.text}"
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/5 pt-1.5 text-[10px]">
                            {schedStatus === "CANCELLED" ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
                                ✕ Schedule Cancelled
                              </span>
                            ) : schedStatus === "SCHEDULED" ? (
                              <>
                                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                                  ✓ Auto-Scheduled on Server!
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCancelSchedule(m.id)}
                                  className="rounded bg-white/10 px-2 py-0.5 text-[9px] text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                                >
                                  ✕ Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleExecuteSchedule(m.id, scheduleData!)}
                                className="inline-flex items-center gap-1 rounded-lg border border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-2.5 py-1 text-[10px] font-bold text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:border-amber-300 hover:bg-amber-500/30 hover:text-white transition-all active:scale-95"
                              >
                                ⚡ Auto-Scheduling...
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {m.role === "assistant" && m.content && !m.isStreaming && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-1.5 text-[9px]">
                  {/* Modern Sleek Copy Icon Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(m.id, m.content)}
                    className="relative inline-flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all active:scale-95 shadow-sm"
                    title={copiedId === m.id ? "Copied to clipboard!" : "Copy message"}
                  >
                    {copiedId === m.id ? (
                      <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth={1.8} />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    )}
                  </button>

                  {/* Smart Insert Action Buttons */}
                  {onInsertToChat && (() => {
                    const drafts = extractDraftOptions(m.content);
                    if (drafts.length <= 1) {
                      return (
                        <button
                          type="button"
                          onClick={() => handleInsert(m.id, m.content, drafts[0])}
                          className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 px-2.5 py-0.5 font-medium text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)] hover:border-cyan-400 hover:bg-cyan-500/25 hover:text-white transition-all active:scale-95"
                          title="Insert clean draft message directly into chat typing box"
                        >
                          {insertedId === m.id ? "✓ Inserted in Chat" : "💬 Insert to Chat"}
                        </button>
                      );
                    }
                    return drafts.map((draft, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleInsert(m.id, m.content, draft)}
                        className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 px-2 py-0.5 font-medium text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)] hover:border-cyan-400 hover:bg-cyan-500/25 hover:text-white transition-all active:scale-95"
                        title={`Insert Option ${idx + 1}: "${draft.slice(0, 30)}..."`}
                      >
                        {insertedId === m.id ? `✓ Option ${idx + 1} Inserted!` : `💬 Option ${idx + 1}`}
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="relative z-10 shrink-0 flex gap-1 overflow-x-auto px-2.5 py-1 border-t border-white/5 bg-slate-950/40 scrollbar-hide">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={p.action}
            className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-950/30 px-2 py-0.5 text-[9px] text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-500/15 hover:text-white transition-all duration-200"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Docked Input Box */}
      <div className="relative z-10 shrink-0 border-t border-white/10 bg-slate-950/90 p-2 backdrop-blur-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-1"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              mode === "polish"
                ? "Paste draft to polish..."
                : activePeerHandle
                ? `Ask Q-AI or help reply to @${activePeerHandle}...`
                : "Ask Q-AI..."
            }
            className="flex-1 rounded-xl border border-cyan-500/30 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:border-cyan-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isGenerating}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
              inputQuery.trim() && !isGenerating
                ? "border-cyan-400 bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)] active:scale-95"
                : "border-slate-800 bg-slate-900/50 text-slate-600 cursor-not-allowed"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>

    </div>
  );
}
