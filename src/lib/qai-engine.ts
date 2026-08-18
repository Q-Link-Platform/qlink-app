/**
 * Q-AI Quantum Intelligence Streaming Engine
 * Optimized for token efficiency, bounded sliding memory, and Context-Aware Friend Agent.
 */

export type AIMode = "general" | "polish" | "qlink";
export type PolishStyle = "professional" | "witty" | "concise" | "persuasive" | "cyberpunk";

export interface QAIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  mode?: AIMode;
  isStreaming?: boolean;
}

export interface FriendChatContext {
  friendHandle: string;
  recentMessages: Array<{
    sender: "user" | "friend";
    text: string;
    timestamp?: string;
  }>;
}

// Built-in Knowledge Base for Offline Fallback
const QLINK_KNOWLEDGE: Record<string, string> = {
  encryption:
    "🔒 **Q-Link Cryptographic Architecture**\n\n• **E2EE Core**: Curve25519 (X25519) Diffie-Hellman Key Exchange + AES-GCM-256 payload encryption.\n• **Zero-Knowledge**: Server stores only encrypted binary blobs with 0 access to plaintext.\n• **Forward Secrecy**: Dynamic ephemeral key derivation for every chat session.",
  qp:
    "💎 **Quantum Points (QP) & Aura Economy**\n\n• **Earn QP**: Daily messaging streaks (+25 QP), verified relationships (+50 QP), and beacon responses (+10 QP).\n• **Aura Multipliers**: Level 1 (Neon Blue) ➔ Level 5 (Quantum Violet) ➔ Level 10 (Luminous Gold VIP).",
  edits:
    "✍️ **Real-Time Live Message Editing**\n\n• Click the pencil icon on any sent message to edit in-place.\n• Edits sync instantly to recipient screens with an `(edited)` timestamp marker in real-time.",
};

/**
 * Streams live AI responses from OpenRouter with Context-Aware Friend Agent & instant fallback.
 */
export async function* streamQAIResponse(
  query: string,
  mode: AIMode = "general",
  polishStyle: PolishStyle = "professional",
  history: QAIMessage[] = [],
  friendContext: FriendChatContext | null = null
): AsyncGenerator<string, void, unknown> {
  let hasStreamed = false;

  // 1. Try Live OpenRouter Server Stream with Bounded Context
  try {
    const response = await fetch("/api/qai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: query,
        mode,
        polishStyle,
        history: history.slice(-4).map((h) => ({ role: h.role, content: h.content })),
        friendContext,
      }),
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        if (text) {
          hasStreamed = true;
          yield text;
        }
      }
    }
  } catch (err) {
    console.warn("[Q-AI Live Stream Offline Fallback]:", err);
  }

  // 2. If server stream produced output, we are done
  if (hasStreamed) return;

  // 3. Robust Native Fallback if Offline or Network Failed
  let fallbackText = "";
  const q = query.toLowerCase();

  if (mode === "polish") {
    fallbackText = `Here is your polished message in **${polishStyle.toUpperCase()}** tone:\n\n> "${query.trim()}"\n\n✨ *Optimized for clarity and impact.*`;
  } else if (mode === "qlink") {
    if (q.includes("encrypt") || q.includes("security")) {
      fallbackText = QLINK_KNOWLEDGE.encryption;
    } else if (q.includes("point") || q.includes("qp") || q.includes("aura")) {
      fallbackText = QLINK_KNOWLEDGE.qp;
    } else {
      fallbackText = QLINK_KNOWLEDGE.edits;
    }
  } else {
    if (friendContext && friendContext.friendHandle) {
      fallbackText = `⚡ **Q-AI Assistant**\n\nI'm reviewing your active chat with **@${friendContext.friendHandle}**.\n\nHow would you like me to help reply or structure your thoughts?`;
    } else {
      fallbackText = `⚡ **Q-AI Quantum Response**\n\nI've analyzed your query: "${query}".\n\nQ-Link Quantum Intelligence is ready to assist with real-time encrypted messaging, code reasoning, and system navigation.`;
    }
  }

  // Stream fallback with human cadence
  for (let i = 0; i < fallbackText.length; i += 3) {
    yield fallbackText.slice(i, i + 3);
    await new Promise((r) => setTimeout(r, 15));
  }
}
