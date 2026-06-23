import { useEffect, useState } from "react";
import { get } from "../api";

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

  useEffect(() => {
    get<UserRow[]>("/admin/users").then(setItems);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Foydalanuvchilar</h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="th">Ism</th>
              <th className="th">Username</th>
              <th className="th">Telefon</th>
              <th className="th">Til</th>
              <th className="th">Ro'yxatdan o'tgan</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td className="td font-medium">{u.first_name ?? "—"}</td>
                <td className="td">{u.username ? `@${u.username}` : "—"}</td>
                <td className="td">{u.phone ?? "—"}</td>
                <td className="td uppercase">{u.language}</td>
                <td className="td">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
