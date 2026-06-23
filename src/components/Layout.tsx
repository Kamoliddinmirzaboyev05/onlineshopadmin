import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../store";

const links = [
  { to: "/", label: "📊 Dashboard", end: true },
  { to: "/orders", label: "🧾 Buyurtmalar" },
  { to: "/restaurants", label: "🍽 Restoranlar" },
  { to: "/couriers", label: "🛵 Kuryerlar" },
  { to: "/zones", label: "🗺 Hududlar" },
  { to: "/users", label: "👥 Foydalanuvchilar" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { admin, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 text-xl font-bold text-brand">All Foods</div>
        <nav className="flex-1 px-2 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm ${
                  isActive ? "bg-brand text-white" : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 text-sm">
          <div className="text-gray-500">{admin?.username} · {admin?.role}</div>
          <button
            onClick={() => {
              logout();
              nav("/login");
            }}
            className="mt-2 text-red-500"
          >
            Chiqish
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
