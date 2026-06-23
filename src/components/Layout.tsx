import {
  Bike, FolderTree, LayoutDashboard, LogOut, MapPin, ReceiptText,
  ShoppingBasket, Store, Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../store";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/orders", label: "Buyurtmalar", icon: ReceiptText },
  { to: "/categories", label: "Kategoriyalar", icon: FolderTree },
  { to: "/products", label: "Mahsulotlar", icon: ShoppingBasket },
  { to: "/couriers", label: "Kuryerlar", icon: Bike },
  { to: "/zones", label: "Hududlar", icon: MapPin },
  { to: "/users", label: "Foydalanuvchilar", icon: Users },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { admin, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-100">
          <span className="grid place-items-center h-9 w-9 rounded-lg bg-brand text-white">
            <Store size={20} />
          </span>
          <span className="text-lg font-bold tracking-tight">All Foods</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-brand text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} />
                {l.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="grid place-items-center h-9 w-9 rounded-full bg-brand/10 text-brand font-semibold uppercase">
              {admin?.username?.[0] ?? "A"}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{admin?.username}</div>
              <div className="text-xs text-slate-400 capitalize">{admin?.role}</div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              nav("/login");
            }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={16} /> Chiqish
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 overflow-auto">{children}</main>
    </div>
  );
}
