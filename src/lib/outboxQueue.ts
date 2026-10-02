/**
 * outboxQueue.ts — Tech-Giant Standard Persistent Chat Outbox
 *
 * Backed by localStorage to survive browser tab closes, app refreshes,
 * and extended offline states.
 */

export interface OutboxItem {
  tempId: string;
  toHandle: string;
  content: string;
  createdAt: string;
  isEncrypted: boolean;
  status: "PENDING" | "SENDING" | "FAILED";
  retries: number;
  lastError?: string;
}

const STORAGE_KEY = "qc_chat_outbox_v1";
const isSSR = typeof window === "undefined";

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("[Outbox] Listener error:", e);
    }
  });
}

function loadQueue(): OutboxItem[] {
  if (isSSR) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OutboxItem[];
  } catch {
    return [];
  }
}

function saveQueue(items: OutboxItem[]): void {
  if (isSSR) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    notify();
  } catch (err) {
    console.warn("[Outbox] Failed to save queue:", err);
  }
}

export const outboxQueue = {
  /**
   * Subscribe to outbox queue changes for reactive UI updates.
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Enqueue a new outgoing message.
   */
  enqueue(item: Omit<OutboxItem, "status" | "retries"> & { status?: OutboxItem["status"] }): OutboxItem {
    const queue = loadQueue();
    const existingIdx = queue.findIndex((q) => q.tempId === item.tempId);
    const fullItem: OutboxItem = {
      ...item,
      status: item.status || "PENDING",
      retries: 0,
    };

    if (existingIdx >= 0) {
      queue[existingIdx] = fullItem;
    } else {
      queue.push(fullItem);
    }

    saveQueue(queue);
    return fullItem;
  },

  /**
   * Dequeue a message upon confirmed delivery.
   */
  dequeue(tempId: string): void {
    const queue = loadQueue().filter((q) => q.tempId !== tempId);
    saveQueue(queue);
  },

  /**
   * Updates status of a queued message.
   */
  markStatus(tempId: string, status: OutboxItem["status"], lastError?: string): void {
    const queue = loadQueue();
    const target = queue.find((q) => q.tempId === tempId);
    if (target) {
      target.status = status;
      if (status === "FAILED") target.retries += 1;
      if (lastError !== undefined) target.lastError = lastError;
      saveQueue(queue);
    }
  },

  /**
   * Returns all items currently in the outbox.
   */
  getAll(): OutboxItem[] {
    return loadQueue();
  },

  /**
   * Returns all pending/failed items for a specific chat peer.
   */
  getForHandle(handle: string): OutboxItem[] {
    const clean = handle.trim().toLowerCase().replace(/^@/, "");
    return loadQueue().filter(
      (q) => q.toHandle.trim().toLowerCase().replace(/^@/, "") === clean
    );
  },

  /**
   * Sequentially flushes all pending and failed messages through a delivery function.
   */
  async flush(sendFn: (item: OutboxItem) => Promise<boolean>): Promise<void> {
    if (isSSR || (typeof navigator !== "undefined" && !navigator.onLine)) {
      return;
    }

    const queue = loadQueue();
    const pendingItems = queue.filter((q) => q.status === "PENDING" || q.status === "FAILED");
    if (pendingItems.length === 0) return;

    for (const item of pendingItems) {
      outboxQueue.markStatus(item.tempId, "SENDING");
      try {
        const success = await sendFn(item);
        if (success) {
          outboxQueue.dequeue(item.tempId);
        } else {
          outboxQueue.markStatus(item.tempId, "FAILED", "Send failed");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error";
        outboxQueue.markStatus(item.tempId, "FAILED", msg);
      }
    }
  },

  /**
   * Clears outbox completely (e.g. on user logout).
   */
  clear(): void {
    if (isSSR) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      notify();
    } catch {}
  },
};
