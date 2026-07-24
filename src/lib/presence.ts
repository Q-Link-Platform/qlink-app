import { prisma } from "./prisma";

/**
 * High-performance presence touch utility.
 * Updates user's `lastSeenAt` in DB whenever any active operation occurs
 * (chat messages, file uploads, posts, reactions, pings, etc.)
 * Runs asynchronously so it never slows down API response times.
 */
export function touchUserPresence(userId: string): void {
  if (!userId) return;

  prisma.user
    .update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    })
    .catch((err) => {
      console.warn("[touchUserPresence] Background presence update skipped:", err?.message || err);
    });
}
