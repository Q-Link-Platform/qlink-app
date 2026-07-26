self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let title = "Q-Link Alert";
  let body = "You have an incoming notification.";
  let icon = "/logo-256.png";
  let url = "/";
  let payload = null;

  if (event.data) {
    try {
      payload = event.data.json();
      title = payload.title || title;
      body = payload.body || body;
      icon = payload.icon || icon;
      url = payload.url || url;
    } catch (e) {
      try {
        body = event.data.text() || body;
      } catch (textErr) {
        // ignore
      }
    }
  }

  const options = {
    body: body,
    icon: icon,
    badge: "/logo-256.png",
    data: (payload && payload.data) ? payload.data : { url: url },
    vibrate: (payload && payload.vibrate) ? payload.vibrate : [500, 200, 500, 200, 1000],
    requireInteraction: payload ? (payload.requireInteraction ?? true) : true,
    renotify: payload ? (payload.renotify ?? true) : true,
    tag: (payload && payload.tag) || `qlink-push-${Date.now()}`,
    actions: [
      { action: "open", title: "⚡ OPEN Q-LINK" }
    ]
  };

  const promise = (async () => {
    try {
      // 1. Always show the notification so Android Chrome never triggers fallback system notice
      await self.registration.showNotification(title, options);

      // 2. Query all currently showing notifications to compute badge count
      const activeNotifications = await self.registration.getNotifications();
      const count = activeNotifications.length;

      // 3. Update the App Badge
      if (typeof navigator !== "undefined" && navigator && "setAppBadge" in navigator) {
        await navigator.setAppBadge(count);
      }

      // 4. Notify open client windows
      try {
        const urlObj = new URL(url, self.location.origin);
        const senderHandle = urlObj.searchParams.get("peer") || urlObj.searchParams.get("chat");
        const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        clientList.forEach((client) => {
          try {
            client.postMessage({
              type: "EMERGENCY_BEACON_RECEIVED",
              senderHandle: (payload && payload.data?.senderHandle) || senderHandle,
              voiceUrl: (payload && payload.data?.voiceUrl) || null,
              noteText: body,
              url: url,
            });
          } catch (e) {
            // ignore
          }
        });
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
