import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  "AQ.Ab8RN6Kj6Hzv_-3XXzQLWYJuYAInz03XY_DfU0QGRNdPNNTz_w";

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
      friendContext = null,
    } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // --- 1. OPTIMIZED STATIC PREFIX SYSTEM PROMPTS (KV-Cache Reuse) ---
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
Whenever you draft or propose a message for the user to send to their friend, ALWAYS wrap the exact message draft in a blockquote > "..." so it can be autonomously extracted and inserted.`;
    }

    // --- 2. CONTEXT-AWARE FRIEND AGENT (Bounded 4-turn window) ---
    let friendContextPrompt = "";
    if (
      friendContext &&
      friendContext.friendHandle &&
      Array.isArray(friendContext.recentMessages) &&
      friendContext.recentMessages.length > 0
    ) {
      const formattedRecent = friendContext.recentMessages
        .slice(-8)
        .map(
          (m: { sender: string; text: string; timestamp?: string }) =>
            `[${m.timestamp || "Recent"}] ${m.sender === "user" ? "User (Me)" : `@${friendContext.friendHandle}`}: ${m.text}`
        )
        .join("\n");

      friendContextPrompt = `\n\n### Active Conversation Context (with friend @${friendContext.friendHandle}):\n${formattedRecent}\n(Use this context to draft accurate, personalized suggestions.)`;
    }

    // --- 3. TIER 1: CHEAPEST NATIVE GEMINI 3.5-FLASH-LITE (High Speed & Lowest Cost) ---
    if (GEMINI_API_KEY) {
      try {
        // Use gemini-3.5-flash-lite for maximum cost efficiency (~$0.0375 / 1M tokens)
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

        const contents = [
          ...history.slice(-4).map((m: { role: string; content: string }) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ];

        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt + friendContextPrompt }],
            },
            contents,
            generationConfig: {
              temperature: mode === "polish" ? 0.7 : 0.75,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (geminiRes.ok && geminiRes.body) {
          const encoder = new TextEncoder();
          const decoder = new TextDecoder();

          const stream = new ReadableStream({
            async start(controller) {
              const reader = geminiRes.body!.getReader();
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
                    if (!trimmed || !trimmed.startsWith("data: ")) continue;
                    try {
                      const data = JSON.parse(trimmed.slice(6));
                      const chunkText =
                        data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                      if (chunkText) {
                        controller.enqueue(encoder.encode(chunkText));
                      }
                    } catch {
                      // skip partial json chunks
                    }
                  }
                }
              } catch (err) {
                console.error("[Gemini Stream Read Error]:", err);
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
        }
      } catch (geminiErr) {
        console.warn("[Gemini Primary Error -> Cascading to OpenRouter Failover]:", geminiErr);
      }
    }

    // --- 4. TIER 2: HIGH-AVAILABILITY FAILOVER VIA OPENROUTER AUTO-ROUTING ---
    const messages = [
      { role: "system", content: systemPrompt + friendContextPrompt },
      ...history.slice(-4).map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: prompt },
    ];

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
      console.error("[Q-AI OpenRouter Failover Error]:", response.status, errText);
      return NextResponse.json(
        { error: `API Error: ${response.status}` },
        { status: response.status }
      );
    }

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
              if (!trimmed || !trimmed.startsWith(":")) continue;
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
                } catch {}
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
