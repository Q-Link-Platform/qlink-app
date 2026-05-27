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

    event.waitUntil(
      self.registration.showNotification(title || "Q-link Alert", options)
    );
  } catch (error) {
    console.error("Error displaying push notification:", error);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there is already a window open with our app
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
    })
  );
});
