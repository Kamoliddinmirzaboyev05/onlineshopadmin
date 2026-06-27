/// <reference lib="webworker" />
// Custom service worker (vite-plugin-pwa injectManifest): precache + Web Push.
// Excluded from the app tsc build (see tsconfig "exclude") — esbuild compiles it.
import { clientsClaim } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

// Activate a freshly deployed worker (with the latest push handler) immediately
// instead of waiting for every tab to close.
self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener("push", (event: PushEvent) => {
  let data: { title?: string; body?: string; url?: string; tag?: string } = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "All Foods", {
      body: data.body || "",
      icon: "/pwa-192.png",
      badge: "/pwa-192.png",
      tag: data.tag,
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  const target = new URL(url, self.location.origin);
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      // Prefer a tab already on the target URL — just focus it.
      for (const client of list) {
        if (new URL(client.url).pathname === target.pathname && "focus" in client) {
          return (client as WindowClient).focus();
        }
      }
      // Otherwise reuse an open window: navigate it to the target, then focus.
      for (const client of list) {
        if ("focus" in client) {
          (client as WindowClient).navigate(target.href);
          return (client as WindowClient).focus();
        }
      }
      return self.clients.openWindow(target.href);
    })
  );
});
