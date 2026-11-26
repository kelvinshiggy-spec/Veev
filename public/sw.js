/* VEEV service worker.
 * - Keeps the app shell, the Help page and core coping tools available offline.
 * - Never caches /api responses (personal content is never stored by the service worker).
 */
const VERSION = "veev-v2";
const CORE = ["/today", "/help", "/protect", "/regulate", "/talk", "/back", "/future/manifesto", "/future/letters", "/future/memories", "/offline.html", "/icon-192.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      for (const url of CORE) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) continue;
          await cache.put(url, res.clone());
          if ((res.headers.get("content-type") || "").includes("text/html")) {
            const html = await res.text();
            const assets = [...new Set((html.match(/\/_next\/static\/[^"'\s)]+/g) || []))];
            await Promise.all(assets.map((a) => cache.add(a).catch(() => {})));
          }
        } catch (e) {}
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/") || /\.(png|svg|ico|woff2?|webmanifest)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) caches.open(VERSION).then((c) => c.put(req, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(url.pathname, copy));
          }
          return res;
        } catch (e) {
          return (
            (await caches.match(url.pathname)) ||
            (await caches.match("/help")) ||
            (await caches.match("/offline.html")) ||
            new Response("Offline. Call 911 for emergencies, or call/text 988.", { headers: { "Content-Type": "text/plain" } })
          );
        }
      })(),
    );
  }
});
