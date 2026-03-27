// ── Cache de datos dinámicos para offline ──
const DATA_CACHE = "la-mesa-data-v1";
const DATA_ROUTES = ["/api/reservations", "/api/orders", "/api/menu"];

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isDataRoute = DATA_ROUTES.some((r) => url.pathname.startsWith(r));
  if (!isDataRoute || event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request.clone())
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(DATA_CACHE).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        return new Response(JSON.stringify({ ok: true, data: [], offline: true }), {
          headers: { "Content-Type": "application/json" },
        });
      })
  );
});

// ── Background Sync — enviar reservas pendientes ──
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-reservations") {
    event.waitUntil(
      // Notificar al cliente para que sincronice (el cliente tiene acceso a localStorage)
      self.clients.matchAll({ type: "window" }).then((list) => {
        list.forEach((client) => client.postMessage({ type: "SYNC_RESERVATIONS" }));
      })
    );
  }
});

// ── Push notifications ──
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = { title: "La Mesa", body: "", url: "/" };
  try { payload = { ...payload, ...event.data.json() }; } catch { /* no-op */ }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/lamesaicon.jpg",
      badge: "/lamesaicon.jpg",
      vibrate: [200, 100, 200],
      sound: "/notification.wav",
      data: { url: payload.url },
    }).then(() => {
      return self.clients.matchAll({ type: "window" }).then((list) => {
        list.forEach((client) => client.postMessage({ type: "PLAY_SOUND" }));
      });
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
