// Custom push handler — se importa desde el SW principal via next-pwa customWorkerSrc
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = { title: "La Mesa", body: "", url: "/" };
  try { payload = { ...payload, ...event.data.json() }; } catch { /* no-op */ }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200, 100, 200],
      data: { url: payload.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url.includes(url) && "focus" in c);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
