self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let title = "Q-link Alert";
  let body = "";
  let icon = "/logo-256.png";
  let url = "/";

  try {
    const payload = event.data.json();
    title = payload.title || title;
    body = payload.body || body;
    icon = payload.icon || icon;
    url = payload.url || url;
  } catch (e) {
    // Fallback if payload is not valid JSON
    body = event.data.text() || "";
  }

  const options = {
    body: body,
    icon: icon,
    badge: "/logo-256.png", // Small icon shown in Android notification bar
    data: {
      url: url
    },
    vibrate: [100, 50, 100], // Vibration pattern
    actions: [
      { action: "open", title: "Open Q-link" }
    ]
  };

    const promise = (async () => {
    try {
      // 1. Show the notification
      await self.registration.showNotification(title || "Q-link Alert", options);

      // 2. Query all currently showing notifications to compute the count
      const activeNotifications = await self.registration.getNotifications();
      const count = activeNotifications.length;

      // 3. Update the App Badge
      if (typeof navigator !== "undefined" && navigator && "setAppBadge" in navigator) {
        await navigator.setAppBadge(count);
      }

      // 4. Extract senderHandle and notify all open client windows
      try {
        const urlObj = new URL(url, self.location.origin);
        const senderHandle = urlObj.searchParams.get("chat");
        if (senderHandle) {
          const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
          clientList.forEach((client) => {
            try {
              client.postMessage({
                type: "NEW_MESSAGE_RECEIVED",
                fromHandle: senderHandle,
              });
            } catch (e) {
              // ignore
            }
          });
        }
      } catch (err) {
        console.error("Error sending message to clients on push:", err);
      }
    } catch (err) {
      console.error("Error inside push event handler promise:", err);
    }
  })();

  event.waitUntil(promise);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  const promise = (async () => {
    try {
      // 1. Update the app badge with the remaining active notifications count
      const activeNotifications = await self.registration.getNotifications();
      const count = activeNotifications.length;
      if (typeof navigator !== "undefined" && navigator && "setAppBadge" in navigator) {
        if (count > 0) {
          await navigator.setAppBadge(count);
        } else {
          await navigator.clearAppBadge();
        }
      }

      // 2. Open or focus the client window
      const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          // Send a message to the client to handle navigation if needed
          try {
            client.postMessage({ type: "NAVIGATE", url: targetUrl });
          } catch (e) {
            console.error("Failed to post message to client:", e);
          }
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    } catch (err) {
      console.error("Error inside notificationclick event handler promise:", err);
    }
  })();

  event.waitUntil(promise);
});
