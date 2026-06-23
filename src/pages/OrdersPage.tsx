import { MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { get, patch } from "../api";
import { OrderListSkeleton } from "../components/Skeleton";
import type { Courier, Order, OrderStatus } from "../types";

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
const money = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ");

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "">("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    const q = filter ? `?status_filter=${filter}` : "";
    get<Order[]>(`/admin/orders${q}`).then((d) => {
      setOrders(d);
      setLoading(false);
    });
  };
  useEffect(() => {
    get<Courier[]>("/admin/couriers").then(setCouriers);
  }, []);
  useEffect(() => {
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, [filter]);

  const setStatus = async (id: number, status: OrderStatus, courier_id?: number) => {
    await patch(`/admin/orders/${id}`, { status, courier_id });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Buyurtmalar</h1>
      <p className="text-slate-500 mb-5">Jonli buyurtmalar taxtasi</p>

      <div className="flex gap-2 mb-5 flex-wrap">
        <button className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${filter === "" ? "bg-brand text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          onClick={() => setFilter("")}>Barchasi</button>
        {STATUSES.map((s) => (
          <button key={s} className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${filter === s ? "bg-brand text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            onClick={() => setFilter(s)}>{LABEL[s]}</button>
        ))}
      </div>

      {loading ? <OrderListSkeleton /> : (
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">№ {o.number}</span>
                  <span className={`pill ${PILL[o.status]}`}>{LABEL[o.status]}</span>
                </div>
                <div className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin size={14} className="shrink-0" /> {o.address_line}
                </div>
                {o.phone && (
                  <div className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Phone size={14} className="shrink-0" /> {o.phone}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold">{money(o.total)} so'm</div>
                <div className="text-xs text-slate-400">{new Date(o.created_at).toLocaleString()}</div>
              </div>
            </div>

            <div className="text-sm text-slate-600 mt-2">
              {o.items.map((it) => `${it.name_uz} ×${it.quantity}`).join(", ")}
            </div>

            <div className="flex flex-wrap gap-2 mt-3 items-center">
              <select
                className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                value={o.status}
                onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
              </select>
              <select
                className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                defaultValue=""
                onChange={(e) => e.target.value && setStatus(o.id, o.status, +e.target.value)}
              >
                <option value="">Kuryer tayinlash…</option>
                {couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="card p-10 text-center text-slate-400">Buyurtmalar yo'q</div>
        )}
      </div>
      )}
    </div>
  );
}
