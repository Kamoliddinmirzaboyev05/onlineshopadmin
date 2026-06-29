import { Check, Clock, MapPin, Navigation, Phone, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { get, patch } from "../api";
import { ErrorRetry, OrderListSkeleton } from "../components/Skeleton";
import type { AdminUser, Order, OrderStatus } from "../types";

const STATUSES: OrderStatus[] = [
  "pending", "confirmed", "preparing", "ready", "delivering", "delivered", "cancelled",
];
const LABEL: Record<OrderStatus, string> = {
  pending: "Yangi", confirmed: "Tasdiqlandi", preparing: "Tayyorlanmoqda",
  ready: "Tayyor", delivering: "Yetkazilmoqda", delivered: "Yetkazildi", cancelled: "Bekor",
};
const PILL: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  preparing: "bg-indigo-100 text-indigo-700",
  ready: "bg-violet-100 text-violet-700",
  delivering: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

// Keyingi qadam: bitta katta tugma. Oqim — Qabul → Tayyorlash → Tayyor →
// Yetkazishga ber (kuryer kerak) → Yakunlash.
const NEXT: Record<OrderStatus, { status: OrderStatus; label: string; cls: string } | null> = {
  pending: { status: "confirmed", label: "Qabul qilish", cls: "bg-emerald-600 hover:bg-emerald-700" },
  confirmed: { status: "preparing", label: "Tayyorlashni boshlash", cls: "bg-indigo-600 hover:bg-indigo-700" },
  preparing: { status: "ready", label: "Tayyor", cls: "bg-violet-600 hover:bg-violet-700" },
  ready: { status: "delivering", label: "Yetkazishga berish", cls: "bg-blue-600 hover:bg-blue-700" },
  delivering: { status: "delivered", label: "Yakunlash (yetkazildi)", cls: "bg-emerald-600 hover:bg-emerald-700" },
  delivered: null,
  cancelled: null,
};

const money = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ");

// Yangi/faol buyurtmalar tepada; yakunlanganlar pastda.
const RANK: Record<OrderStatus, number> = {
  pending: 0, confirmed: 1, preparing: 2, ready: 3, delivering: 4, delivered: 5, cancelled: 6,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<AdminUser[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  // Guard so a poll tick and a manual refresh never run concurrently and
  // clobber each other's (potentially newer) state.
  const inFlight = useRef(false);

  const load = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    const q = filter ? `?status_filter=${filter}` : "";
    try {
      const d = await get<Order[]>(`/admin/orders${q}`);
      setOrders(d);
      setErr(false);
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    get<AdminUser[]>("/admin/courier-accounts").then(setCouriers).catch(() => {});
  }, []);

  const setStatus = async (o: Order, status: OrderStatus) => {
    const prev = orders;
    setBusy(o.id);
    // Optimistic update, rolled back if the request fails.
    setOrders((os) => os.map((x) => (x.id === o.id ? { ...x, status } : x)));
    try {
      await patch(`/admin/orders/${o.id}`, { status, assigned_courier_id: o.assigned_courier_id });
      load();
    } catch {
      setOrders(prev);
      setErr(true);
    } finally {
      setBusy(null);
    }
  };

  const assign = async (o: Order, courierId: number | null) => {
    const prev = orders;
    setBusy(o.id);
    setOrders((os) =>
      os.map((x) => (x.id === o.id ? { ...x, assigned_courier_id: courierId } : x))
    );
    try {
      await patch(`/admin/orders/${o.id}`, {
        status: o.status,
        assigned_courier_id: courierId,
      });
      load();
    } catch {
      setOrders(prev);
      setErr(true);
    } finally {
      setBusy(null);
    }
  };

  const courierName = (id?: number | null) =>
    couriers.find((c) => c.id === id)?.username ?? null;

  const sorted = [...orders].sort(
    (a, b) =>
      RANK[a.status] - RANK[b.status] ||
      +new Date(b.created_at) - +new Date(a.created_at)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Buyurtmalar</h1>
      <p className="text-slate-500 mb-5">Qabul qiling → kuryer biriktiring → yetkazib bering</p>

      <div className="flex gap-2 mb-5 flex-wrap">
        <button className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${filter === "" ? "bg-brand text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          onClick={() => setFilter("")}>Barchasi</button>
        {STATUSES.map((s) => (
          <button key={s} className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${filter === s ? "bg-brand text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            onClick={() => setFilter(s)}>{LABEL[s]}</button>
        ))}
      </div>

      {loading ? <OrderListSkeleton /> : err && orders.length === 0 ? <ErrorRetry onRetry={load} /> : (
      <div className="space-y-4">
        {sorted.map((o) => {
          const next = NEXT[o.status];
          const isNew = o.status === "pending";
          const needsCourier = o.status === "ready" && o.assigned_courier_id == null;
          const itemsCount = o.items.reduce((s, it) => s + it.quantity, 0);
          return (
          <div
            key={o.id}
            className={`card p-4 ${isNew ? "ring-2 ring-amber-300 bg-amber-50/40" : ""}`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">№ {o.number}</span>
                  <span className={`pill ${PILL[o.status]}`}>{LABEL[o.status]}</span>
                  {o.status === "delivering" && o.courier_delivered_at && (
                    <span className="pill bg-amber-100 text-amber-700 inline-flex items-center gap-1">
                      <Clock size={11} /> Mijoz tasdig'i kutilmoqda
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin size={14} className="shrink-0" /> {o.address_line}
                </div>
                {o.phone && (
                  <a href={`tel:${o.phone}`} className="text-sm text-slate-500 flex items-center gap-1.5 hover:text-brand">
                    <Phone size={14} className="shrink-0" /> {o.phone}
                  </a>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold">{money(o.total)} so'm</div>
                <div className="text-xs text-slate-400">{new Date(o.created_at).toLocaleString()}</div>
              </div>
            </div>

            {/* Mahsulotlar — rasm bilan */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {o.items.map((it) => (
                <div key={it.id} className="shrink-0 w-16 text-center">
                  {it.image_url ? (
                    <img src={it.image_url} alt="" className="h-16 w-16 rounded-xl object-cover bg-slate-100" />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center text-xl">🍽</div>
                  )}
                  <div className="text-[11px] text-slate-600 mt-1 leading-tight line-clamp-2">{it.name_uz}</div>
                  <div className="text-[11px] font-semibold text-slate-400">×{it.quantity}</div>
                </div>
              ))}
              <div className="shrink-0 self-center pl-1 text-xs text-slate-400">{itemsCount} dona</div>
            </div>

            {/* Kuryer biriktirish */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                className={`border rounded-lg px-2 py-1.5 text-sm bg-white ${needsCourier ? "border-amber-400 ring-1 ring-amber-300" : "border-slate-300"}`}
                value={o.assigned_courier_id ?? ""}
                disabled={busy === o.id}
                onChange={(e) => assign(o, e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Kuryer biriktirish…</option>
                {couriers.map((c) => (
                  <option key={c.id} value={c.id}>{c.username}</option>
                ))}
              </select>
              {o.assigned_courier_id && (
                <span className="pill bg-slate-100 text-slate-600 inline-flex items-center gap-1">
                  <User size={12} /> {courierName(o.assigned_courier_id) ?? `#${o.assigned_courier_id}`}
                </span>
              )}
              {o.lat != null && o.lng != null && (
                <a
                  href={`https://yandex.com/maps/?rtext=~${o.lat},${o.lng}&rtt=auto`}
                  target="_blank"
                  rel="noreferrer"
                  className="pill bg-blue-50 text-blue-700 inline-flex items-center gap-1 hover:bg-blue-100"
                >
                  <Navigation size={12} /> Xarita
                </a>
              )}
            </div>

            {/* Asosiy amal */}
            <div className="mt-3 flex items-center gap-2">
              {next && (
                <button
                  disabled={busy === o.id || needsCourier}
                  onClick={() => setStatus(o, next.status)}
                  className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 ${next.cls}`}
                  title={needsCourier ? "Avval kuryer biriktiring" : ""}
                >
                  <Check size={16} /> {needsCourier ? "Avval kuryer biriktiring" : next.label}
                </button>
              )}
              {o.status !== "delivered" && o.status !== "cancelled" && (
                <button
                  disabled={busy === o.id}
                  onClick={() => setStatus(o, "cancelled")}
                  className="px-3 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition inline-flex items-center gap-1 disabled:opacity-40"
                >
                  <X size={15} /> Bekor
                </button>
              )}
            </div>
          </div>
          );
        })}
        {orders.length === 0 && (
          <div className="card p-10 text-center text-slate-400">Buyurtmalar yo'q</div>
        )}
      </div>
      )}
    </div>
  );
}
