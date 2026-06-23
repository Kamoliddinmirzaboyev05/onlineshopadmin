import { useEffect, useState } from "react";
import { get } from "../api";
import type { DashboardStats } from "../types";

const money = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ");

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [s, setS] = useState<DashboardStats | null>(null);

  useEffect(() => {
    get<DashboardStats>("/admin/stats").then(setS);
  }, []);

  if (!s) return <div className="text-gray-400">…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Bugungi buyurtmalar" value={String(s.orders_today)} />
        <Stat label="Bugungi tushum" value={`${money(s.revenue_today)} so'm`} />
        <Stat label="Kutilayotgan" value={String(s.pending_orders)} />
        <Stat label="Faol restoranlar" value={String(s.active_restaurants)} />
        <Stat label="Jami buyurtmalar" value={String(s.orders_total)} />
        <Stat label="Jami tushum" value={`${money(s.revenue_total)} so'm`} />
        <Stat label="Foydalanuvchilar" value={String(s.users_total)} />
      </div>
    </div>
  );
}
