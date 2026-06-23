import { get, post } from "./api";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function pushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function notifPermission(): NotificationPermission {
  return pushSupported() ? Notification.permission : "denied";
}

/** Request permission, subscribe via PushManager, register subscription with the backend. */
export async function enablePush(): Promise<NotificationPermission> {
  if (!pushSupported()) return "denied";
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return perm;

  const reg = await navigator.serviceWorker.ready;
  const { public_key } = await get<{ public_key: string }>("/admin/push/public-key");
  if (!public_key) return "denied";

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(public_key).buffer as ArrayBuffer,
    });
  }
  await post("/admin/push/subscribe", sub.toJSON());
  return "granted";
}
