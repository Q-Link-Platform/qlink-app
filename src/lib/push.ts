import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateKey = process.env.VAPID_PRIVATE_KEY!;

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
}

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
) {
  try {
    const rawPayload = JSON.stringify(payload);
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      rawPayload
    );
    console.log(`[web-push] Notification sent successfully to endpoint: ${subscription.endpoint}`);
  } catch (error: any) {
    console.error(`[web-push] Error sending notification to endpoint: ${subscription.endpoint}`, error);
    // Return the raw error so parent can handle if subscription is expired (410 Gone / 404 Not Found)
    throw error;
  }
}
