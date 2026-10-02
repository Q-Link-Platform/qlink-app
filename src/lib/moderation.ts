/**
 * Production-Grade Content Moderation & Anti-Abuse Engine
 * Filters profanity, phishing patterns, automated spam, and assists shadowbanning.
 */

const BLOCKED_PATTERNS = [
  /\b(free\s+crypto|airdrop\s+claim|wallet\s+seed|send\s+eth\s+to|double\s+your\s+btc)\b/i,
  /\b(t\.me\/[a-zA-Z0-9_]+|bit\.ly\/[a-zA-Z0-9_]+|tinyurl\.com\/[a-zA-Z0-9_]+)\b/i,
  /\b(nigger|faggot|chink|kike|retard)\b/i,
];

export interface ModerationResult {
  isSafe: boolean;
  reason?: string;
  autoFlag?: boolean;
  score: number; // 0 (toxic) to 1 (clean)
}

export function inspectContentSafety(text: string): ModerationResult {
  if (!text || typeof text !== "string") {
    return { isSafe: true, score: 1.0 };
  }

  const trimmed = text.trim();

  // Pattern checks
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isSafe: false,
        reason: "Content violated community safety policies (spam/abuse detected).",
        autoFlag: true,
        score: 0.1,
      };
    }
  }

  // Check for excessive repetitive character spam (e.g. aaaaaaaaaaaaaa)
  if (/(.)\1{14,}/.test(trimmed)) {
    return {
      isSafe: false,
      reason: "Repeated character pattern detected.",
      autoFlag: true,
      score: 0.3,
    };
  }

  return {
    isSafe: true,
    score: 1.0,
  };
}

/**
 * Calculates algorithmic engagement score for For You Feed Ranking
 * Incorporates: Aura score, Reactions (Likes/Dislikes), Comments, Views, and Recency Decay.
 */
export function calculateFeedRankScore(params: {
  authorAura?: number;
  reactionsCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: Date | string;
}): number {
  const {
    authorAura = 50,
    reactionsCount = 0,
    commentsCount = 0,
    viewsCount = 0,
    createdAt,
  } = params;

  const createdTime = new Date(createdAt).getTime();
  const hoursOld = Math.max(0, (Date.now() - createdTime) / (1000 * 60 * 60));

  // Normalized aura multiplier (base 1.0, up to 2.5 for high aura)
  const auraMultiplier = Math.max(0.8, 1 + (authorAura / 100));

  // Engagement energy: comments weighted 5x, reactions 2x, views 0.2x
  const engagementEnergy = (reactionsCount * 2) + (commentsCount * 5) + (viewsCount * 0.2) + 1;

  // Gravity / Time decay formula (HackerNews / Reddit style decay)
  const decay = Math.pow(hoursOld + 2, 1.35);

  return (engagementEnergy * auraMultiplier) / decay;
}
