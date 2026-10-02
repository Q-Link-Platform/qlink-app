/**
 * Q-AI Agentic Tools & Autonomous ReAct Ecosystem
 * Standard Silicon Valley / AI-Lab Grade Multi-Agent Framework
 */

export type QAISwarmDomain = 
  | "communication"
  | "emergency"
  | "social"
  | "system";

export interface QAIToolAction {
  swarm: QAISwarmDomain;
  tool: string;
  params?: Record<string, any>;
  message?: string;
  order?: number;
}

export interface QAIAppStateSnapshot {
  activeScreen: "home" | "chat" | "directory" | "settings";
  isQAIOpen: boolean;
  isChatFull: boolean;
  showSettings: boolean;
  showDirectory: boolean;
  activePeerHandle?: string | null;
  isRecording?: boolean;
}

export interface QAIToolDefinition {
  id: string;
  name: string;
  description: string;
  swarm: QAISwarmDomain;
  parameters: {
    name: string;
    type: "string" | "number" | "boolean" | "object";
    description: string;
    required: boolean;
  }[];
}

export const QAI_TOOL_REGISTRY: Record<string, QAIToolDefinition> = {
  // 1. Communication Swarm
  open_chat: {
    id: "open_chat",
    name: "Open Peer Chat",
    description: "Navigates directly to a user conversation by handle or ID.",
    swarm: "communication",
    parameters: [
      { name: "target", type: "string", description: "The handle of the user (e.g. @surajsuthar1971-4083)", required: true },
    ],
  },
  insert_draft: {
    id: "insert_draft",
    name: "Insert Draft into Chat",
    description: "Inserts formulated text directly into active chat input composer.",
    swarm: "communication",
    parameters: [
      { name: "text", type: "string", description: "The text message content to insert", required: true },
    ],
  },
  schedule_message: {
    id: "schedule_message",
    name: "Schedule Offline Message",
    description: "Schedules a message to be automatically delivered at a future time, even if app is closed.",
    swarm: "communication",
    parameters: [
      { name: "target", type: "string", description: "Recipient handle", required: true },
      { name: "text", type: "string", description: "Message content", required: true },
      { name: "minutesFromNow", type: "number", description: "Delay in minutes (optional)", required: false },
      { name: "timeDescription", type: "string", description: "Human-readable time (e.g., 'at 6 PM' or 'tomorrow morning')", required: false },
    ],
  },
  toggle_voice_record: {
    id: "toggle_voice_record",
    name: "Toggle Voice Recording",
    description: "Starts or stops recording voice audio waveform note.",
    swarm: "communication",
    parameters: [
      { name: "start", type: "boolean", description: "True to start, false to stop & send", required: true },
    ],
  },
  open_attachment_picker: {
    id: "open_attachment_picker",
    name: "Open Media Attachment Picker",
    description: "Opens system file tray to pick photos, videos, or documents.",
    swarm: "communication",
    parameters: [],
  },
  edit_last_message: {
    id: "edit_last_message",
    name: "Edit Last Sent Message",
    description: "Enters edit mode for the user's most recent message in the active chat.",
    swarm: "communication",
    parameters: [],
  },

  // 2. Emergency & Security Swarm
  trigger_beacon: {
    id: "trigger_beacon",
    name: "Trigger Emergency Beacon SOS",
    description: "Fires a high-priority crimson emergency distress siren alert to active peer.",
    swarm: "emergency",
    parameters: [
      { name: "target", type: "string", description: "Target peer handle", required: false },
    ],
  },

  // 3. Social & Discovery Swarm
  open_quantum_console: {
    id: "open_quantum_console",
    name: "Open Quantum Link Console",
    description: "Opens community directory, global ID leaderboard, and public feed broadcasts.",
    swarm: "social",
    parameters: [],
  },
  show_aura_guide: {
    id: "show_aura_guide",
    name: "Show Aura Ranks & Points Guide",
    description: "Opens Aura points breakdown modal.",
    swarm: "social",
    parameters: [],
  },

  // 4. System & Navigation Swarm
  navigate_tab: {
    id: "navigate_tab",
    name: "Navigate Screen Tab",
    description: "Switches current view (e.g. settings, chats, feed).",
    swarm: "system",
    parameters: [
      { name: "tab", type: "string", description: "Target screen: 'settings' | 'chats' | 'feed'", required: true },
    ],
  },
  switch_theme: {
    id: "switch_theme",
    name: "Switch Glass UI Theme",
    description: "Toggles between Quantum Cyberpunk (Cyan) and Luminous Apple Glass (Crystal).",
    swarm: "system",
    parameters: [
      { name: "theme", type: "string", description: "'quantum' | 'crystal'", required: true },
    ],
  },
};

type ActionSubscriber = (action: QAIToolAction | QAIToolAction[]) => void;

class QAIActionBus {
  private subscribers: ActionSubscriber[] = [];

  public subscribe(fn: ActionSubscriber) {
    this.subscribers.push(fn);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== fn);
    };
  }

  public dispatch(action: QAIToolAction | QAIToolAction[]) {
    this.subscribers.forEach((fn) => {
      try {
        fn(action);
      } catch (err) {
        console.error("[QAIActionBus Error]:", err);
      }
    });
  }
}

export const qaiActionBus = new QAIActionBus();
