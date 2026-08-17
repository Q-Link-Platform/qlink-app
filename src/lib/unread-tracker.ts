/**
 * Production-Grade Unread Message Tracker Module
 * Manages unread state, deduplication, handle canonicalization, and self-healing storage.
 */

import { cleanHandle } from "./handle-utils";

export interface UnreadMessage {
  id: string;
  sender: string;
}

const STORAGE_KEY = "qlink_unread_messages";

/**
 * Loads and auto-sanitizes unread messages from localStorage.
 * Ensures all handles in storage are canonicalized.
 */
export function loadAndSanitizeUnreadMessages(): UnreadMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seenKeys = new Set<string>();
    const sanitized: UnreadMessage[] = [];

    for (const item of parsed) {
      if (item && typeof item === "object" && typeof item.sender === "string" && typeof item.id === "string") {
        const canonicalSender = cleanHandle(item.sender);
        if (canonicalSender) {
          const uniqueKey = `${canonicalSender}:${item.id}`;
          if (!seenKeys.has(uniqueKey)) {
            seenKeys.add(uniqueKey);
            sanitized.push({
              id: item.id,
              sender: canonicalSender,
            });
          }
        }
      }
    }

    // Persist sanitized state if changed
    if (JSON.stringify(parsed) !== JSON.stringify(sanitized)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    }

    return sanitized;
  } catch {
    return [];
  }
}

/**
 * Persists unread messages safely to localStorage.
 */
export function saveUnreadMessages(messages: UnreadMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    const canonical = messages
      .filter((m) => Boolean(cleanHandle(m.sender)))
      .map((m) => ({
        id: m.id,
        sender: cleanHandle(m.sender),
      }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(canonical));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Removes all unread messages for a specific handle (handles @ and casing variations).
 */
export function markHandleAsRead(
  messages: UnreadMessage[],
  targetHandle: string | null | undefined
): UnreadMessage[] {
  const cleanTarget = cleanHandle(targetHandle);
  if (!cleanTarget) return messages;

  return messages.filter((m) => cleanHandle(m.sender) !== cleanTarget);
}

/**
 * Adds an unread message for a sender if not already present.
 */
export function addUnreadMessage(
  messages: UnreadMessage[],
  msgId: string,
  senderHandle: string | null | undefined
): UnreadMessage[] {
  const cleanSender = cleanHandle(senderHandle);
  if (!cleanSender || !msgId) return messages;

  // Check if message ID or sender already exists in unread set
  if (messages.some((m) => m.id === msgId && cleanHandle(m.sender) === cleanSender)) {
    return messages;
  }

  return [...messages, { id: msgId, sender: cleanSender }];
}

/**
 * Checks if a specific handle has any unread messages.
 */
export function isHandleUnread(
  messages: UnreadMessage[],
  targetHandle: string | null | undefined
): boolean {
  const cleanTarget = cleanHandle(targetHandle);
  if (!cleanTarget) return false;

  return messages.some((m) => cleanHandle(m.sender) === cleanTarget);
}

/**
 * Gets a set of unique canonical handles that have unread messages.
 */
export function getUnreadSendersSet(messages: UnreadMessage[]): Set<string> {
  const set = new Set<string>();
  for (const m of messages) {
    const cleaned = cleanHandle(m.sender);
    if (cleaned) set.add(cleaned);
  }
  return set;
}
