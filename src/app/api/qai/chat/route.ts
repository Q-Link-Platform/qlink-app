import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  "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";

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      mode = "general",
      polishStyle = "professional",
      history = [],
      friendContext = null, // { friendHandle: string, recentMessages: Array<{ sender: 'user'|'friend', text: string, timestamp?: string }> }
    } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // --- 1. OPTIMIZED STATIC PREFIX SYSTEM PROMPT (For KV-Cache Sharing & 90% Cost Reduction) ---
    let systemPrompt = "";
    if (mode === "polish") {
      systemPrompt = `You are the Q-Link Message Polisher Assistant.
Your task is to take the user's draft message and rewrite it into a ${polishStyle.toUpperCase()} tone.
Rules:
1. Provide the rewritten message clearly.
2. Put the final recommended message in a blockquote using > "...", so the user can easily copy and insert it into chat.
3. Keep the user's core intent while optimizing vocabulary, clarity, impact, and charisma.
4. Keep explanations minimal and punchy.`;
    } else if (mode === "qlink") {
      systemPrompt = `You are Q-AI, the official Quantum Link Architecture Specialist.
Q-Link Specifications:
- Cryptography: Native Web Crypto API using Curve25519 (X25519) key exchange + AES-GCM-256 authenticated end-to-end encryption (E2EE). Ephemeral session keys with zero-knowledge server storage.
- Identity: Decentralized quantum handles with verified blue badge checkmarks.
- Economy & Aura: Quantum Points (QP) earned via daily messaging streaks, high network activity, referral links, and verified interactions. High Aura unlocks holographic glowing badges, VIP presence, and custom neon themes.
- Real-time Features: Instant message edits with live peer sync, emergency Q-BEACON priority alerts that bypass DND, voice audio messaging, encrypted attachments up to 50MB, and offline background push notifications.
Respond accurately, concisely, and helpfully with modern markdown formatting.`;
    } else {
      systemPrompt = `You are Q-AI, the Quantum Link Intelligent Copilot.
You are embedded directly beside the user's live encrypted conversation with their friend.
You are ultra-intelligent, fast, concise, helpful, and empathetic.
You can help with general questions, problem solving, creative brainstorming, coding, and drafting contextual replies to their friend.
Keep responses concise, modern, and beautifully formatted with markdown.`;
    }

    // --- 2. CONTEXT-AWARE FRIEND AGENT (Bounded 4-Message Sliding Window) ---
    let friendContextPrompt = "";
    if (friendContext && friendContext.friendHandle && Array.isArray(friendContext.recentMessages) && friendContext.recentMessages.length > 0) {
      const formattedRecent = friendContext.recentMessages
        .slice(-8) // Strictly bounded to max 8 items (approx 4 from each side)
        .map(
          (m: { sender: string; text: string; timestamp?: string }) =>
            `[${m.timestamp || "Recent"}] ${m.sender === "user" ? "User (Me)" : `@${friendContext.friendHandle}`}: ${m.text}`
        )
        .join("\n");

      friendContextPrompt = `\n\n### Active Conversation Context (with friend @${friendContext.friendHandle}):
${formattedRecent}
\n(Use this context to give highly personalized, accurate suggestions and answers when the user refers to their conversation or friend.)`;
    }

    // --- 3. BOUNDED SLIDING MEMORY (Prevents Token Explosion) ---
    const messages = [
      { role: "system", content: systemPrompt + friendContextPrompt },
      ...history.slice(-4).map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: prompt },
    ];

    // --- 4. CALL OPENROUTER API ---
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://q-link.app",
        "X-Title": "Q-Link Quantum Platform",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages,
        temperature: mode === "polish" ? 0.7 : 0.75,
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[Q-AI OpenRouter Error]:", response.status, errText);
      return NextResponse.json(
        { error: `OpenRouter API Error: ${response.status}` },
        { status: response.status }
      );
    }

    // Transform OpenRouter SSE stream into client readable stream
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(":")) continue;
              if (trimmed === "data: [DONE]") {
                controller.close();
                return;
              }
              if (trimmed.startsWith("data: ")) {
                try {
                  const data = JSON.parse(trimmed.slice(6));
                  const textChunk = data.choices?.[0]?.delta?.content || "";
                  if (textChunk) {
                    controller.enqueue(encoder.encode(textChunk));
                  }
                } catch {
                  // Skip json parse error on partial lines
                }
              }
            }
          }
        } catch (err) {
          console.error("[Q-AI Stream Error]:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    console.error("[Q-AI Route Error]:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
