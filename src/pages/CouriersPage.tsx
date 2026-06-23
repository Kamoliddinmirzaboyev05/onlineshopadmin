import { useEffect, useState } from "react";
import { del, get, post, put } from "../api";
import type { Courier } from "../types";

export default function CouriersPage() {
  const [items, setItems] = useState<Courier[]>([]);
  const [editing, setEditing] = useState<Partial<Courier> | null>(null);

  const load = () => get<Courier[]>("/admin/couriers").then(setItems);
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    const body = {
      name: editing.name ?? "",
      phone: editing.phone ?? "",
      telegram_id: editing.telegram_id ?? null,
      is_active: editing.is_active ?? true,
    };
    if (editing.id) await put(`/admin/couriers/${editing.id}`, body);
    else await post("/admin/couriers", body);
    setEditing(null);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Kuryerlar</h1>
        <button className="btn" onClick={() => setEditing({ is_active: true })}>+ Qo'shish</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="th">Ism</th>
              <th className="th">Telefon</th>
              <th className="th">Telegram ID</th>
              <th className="th">Holat</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td className="td font-medium">{c.name}</td>
                <td className="td">{c.phone ?? "—"}</td>
                <td className="td">{c.telegram_id ?? "—"}</td>
                <td className="td">
                  <span className={c.is_active ? "text-green-600" : "text-gray-400"}>
                    {c.is_busy ? "Band" : c.is_active ? "Bo'sh" : "Nofaol"}
                  </span>
                </td>
                <td className="td text-right space-x-2">
                  <button className="text-gray-600" onClick={() => setEditing(c)}>✎</button>
                  <button className="text-red-500" onClick={() => del(`/admin/couriers/${c.id}`).then(load)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="card p-6 w-96 space-y-3">
            <h2 className="font-bold text-lg">{editing.id ? "Tahrirlash" : "Yangi kuryer"}</h2>
            <input className="input" placeholder="Ism" value={editing.name ?? ""}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <input className="input" placeholder="Telefon" value={editing.phone ?? ""}
              onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
            <input className="input" type="number" placeholder="Telegram ID" value={editing.telegram_id ?? ""}
              onChange={(e) => setEditing({ ...editing, telegram_id: +e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.is_active ?? true}
                onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Faol
            </label>
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn-ghost" onClick={() => setEditing(null)}>Bekor</button>
              <button className="btn" onClick={save}>Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
