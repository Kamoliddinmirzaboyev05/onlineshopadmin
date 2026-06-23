import { useEffect, useState } from "react";
import { get, patch } from "../api";
import type { Courier, Order, OrderStatus } from "../types";

const STATUSES: OrderStatus[] = [
  "pending", "confirmed", "preparing", "ready", "delivering", "delivered", "cancelled",
];
const LABEL: Record<OrderStatus, string> = {
  pending: "Yangi", confirmed: "Tasdiqlandi", preparing: "Tayyorlanmoqda",
  ready: "Tayyor", delivering: "Yetkazilmoqda", delivered: "Yetkazildi", cancelled: "Bekor",
};
const money = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ");

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "">("");

  const load = () => {
    const q = filter ? `?status_filter=${filter}` : "";
    get<Order[]>(`/admin/orders${q}`).then(setOrders);
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
      <h1 className="text-2xl font-bold mb-4">Buyurtmalar</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button className={`px-3 py-1 rounded-full text-sm ${filter === "" ? "bg-brand text-white" : "bg-gray-100"}`}
          onClick={() => setFilter("")}>Barchasi</button>
        {STATUSES.map((s) => (
          <button key={s} className={`px-3 py-1 rounded-full text-sm ${filter === s ? "bg-brand text-white" : "bg-gray-100"}`}
            onClick={() => setFilter(s)}>{LABEL[s]}</button>
        ))}
      </div>

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">№ {o.number}</div>
                <div className="text-sm text-gray-500">📍 {o.address_line}</div>
                {o.phone && <div className="text-sm text-gray-500">📱 {o.phone}</div>}
              </div>
              <div className="text-right">
                <div className="font-bold">{money(o.total)} so'm</div>
                <div className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString()}</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mt-2">
              {o.items.map((it) => `${it.name_uz} ×${it.quantity}`).join(", ")}
            </div>

            <div className="flex flex-wrap gap-2 mt-3 items-center">
              <select
                className="border rounded-lg px-2 py-1 text-sm"
                value={o.status}
                onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
              </select>
              <select
                className="border rounded-lg px-2 py-1 text-sm"
                defaultValue=""
                onChange={(e) => e.target.value && setStatus(o.id, o.status, +e.target.value)}
              >
                <option value="">Kuryer tayinlash…</option>
                {couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-gray-400">Buyurtmalar yo'q</p>}
      </div>
    </div>
  );
}
