import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  "AQ.Ab8RN6Kj6Hzv_-3XXzQLWYJuYAInz03XY_DfU0QGRNdPNNTz_w";

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  "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";

// --- IN-MEMORY CACHED APP GUIDE KNOWLEDGE BASE ---
let cachedGuideSections: Record<string, string> | null = null;

function getGuideSections(): Record<string, string> {
  if (cachedGuideSections) return cachedGuideSections;

  const sections: Record<string, string> = {};
  try {
    const guidePath = path.join(process.cwd(), "src", "lib", "qlink-app-guide.txt");
    if (fs.existsSync(guidePath)) {
      const fileContent = fs.readFileSync(guidePath, "utf-8");
      const matches = fileContent.matchAll(
        /\[SECTION:\s*([A-Z0-9_]+)\]\n([\s\S]*?)(?=\n\[SECTION:|$)/g
      );
      for (const m of matches) {
        sections[m[1]] = m[2].trim();
      }
    }
  } catch (err) {
    console.error("[Q-AI Knowledge Base Load Error]:", err);
  }

  cachedGuideSections = sections;
  return sections;
}

// --- ON-DEMAND KNOWLEDGE RETRIEVAL AGENT (Token-Efficient Slicer) ---
function retrieveRelevantGuide(query: string): string {
  const q = query.toLowerCase();

  const isAppOrFeatureQuery = [
    "feature",
    "app",
    "q-link",
    "qlink",
    "console",
    "feed",
    "beacon",
    "point",
    "qp",
    "streak",
    "aura",
    "edit",
    "voice",
    "mic",
    "attach",
    "file",
    "instagram",
    "twitter",
    "x ",
    "signal",
    "telegram",
    "reddit",
    "karma",
    "how to",
    "how do i",
    "how does",
    "problem",
    "reconnect",
    "guide",
    "manual",
    "explain",
    "button",
    "where to tap",
  ].some((k) => q.includes(k));

  if (!isAppOrFeatureQuery) return "";

  const sections = getGuideSections();
  const matchedTags: string[] = [];

  if (
    [
      "why q-link",
      "why qlink",
      "better than",
      "vs instagram",
      "vs twitter",
      "vs facebook",
      "vs meta",
      "vs x",
      "tracking",
      "privacy",
      "surveillance",
      "shadow profile",
      "data selling",
      "ai training",
      "non profit",
      "honest",
      "addiction",
      "dopamine",
      "brainwash",
      "snooping",
      "dark reality",
    ].some((k) => q.includes(k))
  ) {
    matchedTags.push("WHY_QLINK_VS_BIG_TECH_SURVEILLANCE");
  }

  if (
    [
      "compare",
      "instagram",
      "twitter",
      "x ",
      "signal",
      "telegram",
      "reddit",
      "karma",
      "what is q-link",
      "overview",
      "what features",
      "tell me about",
    ].some((k) => q.includes(k))
  ) {
    matchedTags.push("OVERVIEW_AND_ANALOGIES");
  }

  if (
    ["encrypt", "e2ee", "security", "crypto", "safe", "privacy", "tick", "receipt"].some(
      (k) => q.includes(k)
    )
  ) {
    matchedTags.push("ENCRYPTED_CHAT_AND_E2EE");
  }

  if (["edit", "sync", "modify message", "change message"].some((k) => q.includes(k))) {
    matchedTags.push("LIVE_SYNC_AND_EDITS");
  }

  if (
    [
      "voice",
      "mic",
      "audio",
      "attach",
      "file",
      "media",
      "video",
      "image",
      "pdf",
    ].some((k) => q.includes(k))
  ) {
    matchedTags.push("MEDIA_VOICE_ATTACHMENTS");
  }

  if (["beacon", "sos", "emergency", "siren", "urgent"].some((k) => q.includes(k))) {
    matchedTags.push("Q_BEACON_EMERGENCY");
  }

  if (
    ["point", "qp", "streak", "aura", "badge", "level", "vip", "diamond", "sapphire"].some(
      (k) => q.includes(k)
    )
  ) {
    matchedTags.push("QUANTUM_POINTS_AND_AURA");
  }

  if (
    ["feed", "post", "broadcast", "hashtag", "community", "social"].some((k) =>
      q.includes(k)
    )
  ) {
    matchedTags.push("FEED_AND_COMMUNITY");
  }

  if (
    [
      "how to",
      "where to tap",
      "button",
      "navigate",
      "problem",
      "error",
      "disconnect",
      "reconnect",
      "permission",
    ].some((k) => q.includes(k))
  ) {
    matchedTags.push("UI_NAVIGATION_AND_TROUBLESHOOTING");
  }

  if (matchedTags.length === 0) {
    matchedTags.push("OVERVIEW_AND_ANALOGIES", "UI_NAVIGATION_AND_TROUBLESHOOTING");
  }

  const selectedTexts = matchedTags
    .map((tag) => sections[tag])
    .filter(Boolean)
    .slice(0, 3); // Max 3 sliced sections to protect token budget

  if (selectedTexts.length === 0) return "";

  return `\n\n### Q-Link Official App Manual & Knowledge Base Context:\n${selectedTexts.join(
    "\n\n"
  )}\n(Use the above official manual to provide friendly, clear explanations, draw social media comparisons, and provide step-by-step UI button instructions.)`;
}

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

    // --- 1. SYSTEM PROMPT (Optimized Prefix Caching) ---
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
Whenever you draft or propose a message for the user to send to their friend, ALWAYS wrap the exact message draft in a blockquote > "..." so it can be autonomously extracted and inserted.
When explaining app features, be super friendly, use relatable social media comparisons (e.g. Feed like X/Instagram, Chat like Signal Secret Chats, QP/Aura like Reddit Karma/Gamer ranks), and give exact step-by-step UI button instructions.`;
    }

    // --- 2. CONTEXT-AWARE FRIEND AGENT ---
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

    // --- 3. ON-DEMAND APP GUIDE RETRIEVAL SLICER ---
    const guideContextPrompt = retrieveRelevantGuide(prompt);

    const completeSystemInstruction =
      systemPrompt + friendContextPrompt + guideContextPrompt;

    // --- 4. TIER 1: CHEAPEST NATIVE GEMINI 3.5-FLASH-LITE ---
    if (GEMINI_API_KEY) {
      try {
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
              parts: [{ text: completeSystemInstruction }],
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
                    } catch {}
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
        console.warn("[Gemini Primary Fallback to OpenRouter]:", geminiErr);
      }
    }

    // --- 5. TIER 2: HIGH-AVAILABILITY OPENROUTER FAILOVER ---
    const messages = [
      { role: "system", content: completeSystemInstruction },
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
