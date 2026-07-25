import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BMQemcbop-dfZ7bLlwyL083mRANSiRsNbggorApxFfg5U-M_KKMVpwoUdZGM4mbG5rpav7w-vZbcNhiWtW4hvQE";
const privateKey = process.env.VAPID_PRIVATE_KEY || "I5NjyNbTc0y2nofulJoS5BllzTDDEw02UMbIHXnKrsI";

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    "mailto:support@qlink.chat",
    publicKey,
    privateKey
  );
} else {
  console.warn("[web-push] Warning: VAPID keys not configured in environment variables!");
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  urgency?: "high" | "normal" | "low" | "very-low";
  requireInteraction?: boolean;
  vibrate?: number[];
  tag?: string;
  data?: Record<string, any>;
}

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
) {
  try {
    const rawPayload = JSON.stringify(payload);
    const options: Record<string, any> = {
      headers: {
        urgency: payload.urgency || "high",
        topic: "emergency-beacon",
      },
      TTL: payload.urgency === "high" ? 86400 : 3600,
    };

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      rawPayload,
      options
    );
    console.log(`[web-push] Notification sent successfully to endpoint: ${subscription.endpoint}`);
  } catch (error: any) {
    console.error(`[web-push] Error sending notification to endpoint: ${subscription.endpoint}`, error);
    throw error;
  }
}
