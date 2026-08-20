"use client";

// ==============================================================================
// Q-LINK FULL APP CONTROL AGENTIC AI ECOSYSTEM — TOOL REGISTRY & ACTION BUS
// ==============================================================================

export type SwarmDomain =
  | "communication"
  | "emergency"
  | "social"
  | "system";

export type QAIToolType =
  // 1. Communication Swarm (8 Tools)
  | "open_chat"
  | "edit_last_message"
  | "delete_message"
  | "insert_draft"
  | "toggle_voice_record"
  | "open_attachment_picker"
  | "schedule_message"
  | "search_chat_history"
  // 2. Emergency & Security Swarm (4 Tools)
  | "trigger_beacon"
  | "panic_wipe_chat"
  | "reconnect_relays"
  | "verify_e2ee_keys"
  // 3. Social & Community Swarm (6 Tools)
  | "publish_feed_post"
  | "add_hashtag"
  | "like_post"
  | "comment_post"
  | "check_rank"
  | "claim_streak_qp"
  // 4. System & Identity Swarm (5 Tools)
  | "switch_theme"
  | "navigate_tab"
  | "toggle_sound_fx"
  | "customize_profile"
  | "show_aura_guide"
  | "open_quantum_console";

export interface QAIToolAction<T = any> {
  id?: string;
  swarm: SwarmDomain;
  tool: QAIToolType;
  params: T;
  requiresConfirmation?: boolean;
  message?: string;
  timestamp?: number;
}

type ActionSubscriber = (action: QAIToolAction) => void;

class QAIActionBus {
  private subscribers: Set<ActionSubscriber> = new Set();

  public subscribe(callback: ActionSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public dispatch(action: QAIToolAction): void {
    const fullAction: QAIToolAction = {
      ...action,
      id: action.id || `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: action.timestamp || Date.now(),
    };

    this.subscribers.forEach((cb) => {
      try {
        cb(fullAction);
      } catch (err) {
        console.error("[QAI ActionBus Subscriber Error]:", err);
      }
    });
  }
}

export const qaiActionBus = new QAIActionBus();
