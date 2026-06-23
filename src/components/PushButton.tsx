import { Bell, BellOff, BellRing } from "lucide-react";
import { useState } from "react";
import { enablePush, notifPermission, pushSupported } from "../push";

export default function PushButton() {
  const [perm, setPerm] = useState<NotificationPermission>(notifPermission());
  const [busy, setBusy] = useState(false);

  if (!pushSupported()) return null;

  if (perm === "granted") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-emerald-600">
        <BellRing size={14} /> Bildirishnoma yoniq
      </div>
    );
  }

  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        setPerm(await enablePush());
        setBusy(false);
      }}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
    >
      {perm === "denied" ? <BellOff size={16} /> : <Bell size={16} />}
      {perm === "denied" ? "Bildirishnoma bloklangan" : busy ? "..." : "Bildirishnomani yoqish"}
    </button>
  );
}
