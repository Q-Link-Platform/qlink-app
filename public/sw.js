self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const { title, body, icon, url } = payload;

    const options = {
      body: body || "",
      icon: icon || "/logo-256.png",
      badge: "/logo-256.png", // Small icon shown in Android notification bar
      data: {
        url: url || "/"
      },
      vibrate: [100, 50, 100], // Vibration pattern
      actions: [
        { action: "open", title: "Open Q-link" }
      ]
    };

    const promise = (async () => {
      // 1. Show the notification
      await self.registration.showNotification(title || "Q-link Alert", options);

      // 2. Query all currently showing notifications to compute the count
      const activeNotifications = await self.registration.getNotifications();
      const count = activeNotifications.length;

      // 3. Update the App Badge
      if (navigator && "setAppBadge" in navigator) {
        await navigator.setAppBadge(count);
      }
    })();

    event.waitUntil(promise);
  } catch (error) {
    console.error("Error displaying push notification:", error);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  const promise = (async () => {
    // 1. Update the app badge with the remaining active notifications count
    const activeNotifications = await self.registration.getNotifications();
    const count = activeNotifications.length;
    if (navigator && "setAppBadge" in navigator) {
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
  })();

  event.waitUntil(promise);
});
