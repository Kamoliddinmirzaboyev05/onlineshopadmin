import { useEffect, useState } from "react";
import { get } from "../api";
import { TableSkeleton } from "../components/Skeleton";

interface UserRow {
  id: number;
  telegram_id: number;
  username?: string | null;
  first_name?: string | null;
  phone?: string | null;
  language: string;
  created_at: string;
}

export default function UsersPage() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get<UserRow[]>("/admin/users").then((d) => { setItems(d); setLoading(false); });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-5">Foydalanuvchilar</h1>
      {loading ? <TableSkeleton cols={5} /> : (
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="th">Ism</th>
              <th className="th">Username</th>
              <th className="th">Telefon</th>
              <th className="th">Til</th>
              <th className="th">Ro'yxatdan o'tgan</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/60">
                <td className="td font-medium text-slate-900">{u.first_name ?? "—"}</td>
                <td className="td">{u.username ? `@${u.username}` : "—"}</td>
                <td className="td">{u.phone ?? "—"}</td>
                <td className="td uppercase">{u.language}</td>
                <td className="td">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
