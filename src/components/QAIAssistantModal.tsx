"use client";

import React, { useState, useRef, useEffect } from "react";
import { AIMode, PolishStyle, QAIMessage, streamQAIResponse, polishMessageText } from "@/lib/qai-engine";

interface QAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToChat?: (text: string) => void;
  activeDraftText?: string;
}

export default function QAIAssistantModal({
  isOpen,
  onClose,
  onInsertToChat,
  activeDraftText = "",
}: QAIAssistantModalProps) {
  const [mode, setMode] = useState<AIMode>("general");
  const [polishStyle, setPolishStyle] = useState<PolishStyle>("professional");
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<QAIMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "👋 Welcome to **Q-AI Quantum Intelligence**.\n\nI can assist you with real-time reasoning, drafting or polishing messages in multiple tones, and explaining Q-Link cryptographic architecture. How can I help you right now?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mode: "general",
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (!isMinimized && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating, isMinimized, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      textareaRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

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
      for await (const chunk of streamQAIResponse(textToSend, mode, polishStyle)) {
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: accumulated } : m))
        );
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
    // Strip markdown formatting symbols for clean clipboard
    const clean = text.replace(/^[>#*\-]+\s*/gm, "").trim();
    navigator.clipboard.writeText(clean);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsert = (text: string) => {
    // Extract blockquote or raw text
    const match = text.match(/>\s*"([\s\S]*?)"/);
    const textToInsert = match ? match[1] : text.replace(/^[>#*\-]+\s*/gm, "").trim();
    if (onInsertToChat) {
      onInsertToChat(textToInsert);
    }
    setIsMinimized(true);
  };

  // Quick Action Chips
  const quickPrompts = [
    { label: "✍️ Polish Draft", action: () => { setMode("polish"); if (activeDraftText) handleSend(activeDraftText); } },
    { label: "💎 Quantum Points & Aura", action: () => { setMode("qlink"); handleSend("How do I earn Quantum Points and boost my Aura?"); } },
    { label: "🔐 Security & E2EE", action: () => { setMode("qlink"); handleSend("Explain Q-Link cryptographic architecture"); } },
    { label: "⚡ Message Edit Guide", action: () => { setMode("qlink"); handleSend("How does real-time message editing work?"); } },
  ];

  // Minimized Floating Pill View
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999] animate-float-in">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="group relative flex items-center gap-3 rounded-full border border-cyan-400/50 bg-slate-950/90 px-4 py-2.5 shadow-[0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-2xl transition-all duration-300 hover:border-cyan-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(6,182,212,0.6)]"
        >
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-200">
              Q-AI Assistant
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              {isGenerating ? "Synthesizing..." : "Session Active • Click to Expand"}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="ml-1 rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Close AI"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative flex h-[85vh] max-h-[720px] w-full max-w-2xl flex-col rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-slate-950/95 shadow-[0_12px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.15)] backdrop-blur-3xl overflow-hidden transition-all duration-300">
        
        {/* Ambient Specular Highlight */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 -bottom-32 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

        {/* HUD Top Bar */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/60 px-5 py-3.5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Holographic Reactor Core */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 via-sky-600/10 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <div className={`h-2.5 w-2.5 rounded-full bg-cyan-400 ${isGenerating ? "animate-ping" : "animate-pulse"}`} />
              <div className="absolute inset-0 rounded-xl border border-cyan-300/30 animate-spin" style={{ animationDuration: "8s" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white">
                  Q-AI Intelligence HUD
                </h3>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.2 text-[9px] font-mono font-semibold text-cyan-300">
                  v3.0 Neural
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Standalone Native Engine • Low Latency
              </p>
            </div>
          </div>

          {/* Window Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-cyan-300 transition-colors"
              title="Minimize to Dock"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13H5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
              title="Close Q-AI"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Intelligence Mode Tabs */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/5 bg-slate-950/40 px-4 py-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMode("general")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all duration-200 ${
                mode === "general"
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              💡 General
            </button>
            <button
              type="button"
              onClick={() => setMode("polish")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all duration-200 ${
                mode === "polish"
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              ✍️ Polish Draft
            </button>
            <button
              type="button"
              onClick={() => setMode("qlink")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all duration-200 ${
                mode === "qlink"
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              🛡️ Q-Link Info
            </button>
          </div>

          {/* Tone Selector for Polish Mode */}
          {mode === "polish" && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500 font-mono">Tone:</span>
              <select
                value={polishStyle}
                onChange={(e) => setPolishStyle(e.target.value as PolishStyle)}
                className="rounded-md border border-cyan-500/30 bg-slate-900 px-2 py-0.5 text-[11px] text-cyan-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="professional">Professional</option>
                <option value="witty">Witty</option>
                <option value="concise">Concise</option>
                <option value="persuasive">Persuasive</option>
                <option value="cyberpunk">Cyberpunk</option>
              </select>
            </div>
          )}
        </div>

        {/* Message Stream */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-mono text-slate-500">
                  {m.role === "user" ? "You" : "Q-AI Core"}
                </span>
                <span className="text-[9px] font-mono text-slate-600">{m.timestamp}</span>
              </div>

              <div
                className={`relative max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all duration-200 ${
                  m.role === "user"
                    ? "border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 to-slate-900/80 text-cyan-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                    : "border border-white/10 bg-slate-900/70 text-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl"
                }`}
              >
                {/* Markdown-style content rendering */}
                <div className="whitespace-pre-wrap space-y-2">
                  {m.content || (
                    <span className="inline-flex items-center gap-1.5 text-cyan-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Synthesizing intelligence...
                    </span>
                  )}
                </div>

                {/* Assistant Action Buttons */}
                {m.role === "assistant" && m.content && !m.isStreaming && (
                  <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, m.content)}
                      className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {copiedId === m.id ? "✓ Copied" : "📋 Copy"}
                    </button>
                    {onInsertToChat && (
                      <button
                        type="button"
                        onClick={() => handleInsert(m.content)}
                        className="inline-flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-colors"
                      >
                        💬 Insert to Chat
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="relative z-10 flex gap-2 overflow-x-auto px-4 py-2 border-t border-white/5 bg-slate-950/40 scrollbar-hide">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={p.action}
              className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-950/30 px-3 py-1 text-[11px] text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-500/15 hover:text-white transition-all duration-200"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Command Console Input Area */}
        <div className="relative z-10 border-t border-white/10 bg-slate-950/80 p-3.5 backdrop-blur-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center gap-2"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                mode === "polish"
                  ? "Paste message draft to polish..."
                  : mode === "qlink"
                  ? "Ask anything about Q-Link features, encryption, QP..."
                  : "Ask Q-AI anything (Enter to send, Shift+Enter for new line)..."
              }
              className="flex-1 resize-none rounded-2xl border border-cyan-500/30 bg-slate-900/90 px-4 py-3 text-xs text-slate-100 placeholder-slate-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 max-h-28"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isGenerating}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-all duration-200 ${
                inputQuery.trim() && !isGenerating
                  ? "border-cyan-400 bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-[0_0_18px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95"
                  : "border-slate-800 bg-slate-900/50 text-slate-600 cursor-not-allowed"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
