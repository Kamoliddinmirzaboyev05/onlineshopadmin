import {
  Clock, ReceiptText, ShoppingBag, Store, TrendingUp, Users, Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { get } from "../api";
import { StatCardsSkeleton } from "../components/Skeleton";
import type { DashboardStats } from "../types";

const money = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ");

function Stat({
  label, value, icon: Icon, tint,
}: { label: string; value: string; icon: LucideIcon; tint: string }) {
  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-2xl font-bold mt-1 tracking-tight">{value}</div>
      </div>
      <span className={`grid place-items-center h-10 w-10 rounded-lg ${tint}`}>
        <Icon size={20} />
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [s, setS] = useState<DashboardStats | null>(null);

  useEffect(() => {
    get<DashboardStats>("/admin/stats").then(setS);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
      <p className="text-slate-500 mb-6">Umumiy ko'rsatkichlar</p>
      {!s ? <StatCardsSkeleton /> : (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Bugungi buyurtmalar" value={String(s.orders_today)} icon={ShoppingBag} tint="bg-orange-50 text-orange-600" />
        <Stat label="Bugungi tushum" value={`${money(s.revenue_today)} so'm`} icon={Wallet} tint="bg-emerald-50 text-emerald-600" />
        <Stat label="Kutilayotgan" value={String(s.pending_orders)} icon={Clock} tint="bg-amber-50 text-amber-600" />
        <Stat label="Faol restoranlar" value={String(s.active_restaurants)} icon={Store} tint="bg-indigo-50 text-indigo-600" />
        <Stat label="Jami buyurtmalar" value={String(s.orders_total)} icon={ReceiptText} tint="bg-sky-50 text-sky-600" />
        <Stat label="Jami tushum" value={`${money(s.revenue_total)} so'm`} icon={TrendingUp} tint="bg-emerald-50 text-emerald-600" />
        <Stat label="Foydalanuvchilar" value={String(s.users_total)} icon={Users} tint="bg-violet-50 text-violet-600" />
      </div>
      )}
    </div>
  );
}
