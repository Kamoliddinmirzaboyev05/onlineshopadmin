import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { del, get, post, put } from "../api";
import type { Restaurant } from "../types";

const empty = {
  name: "", description_uz: "", description_ru: "",
  is_active: true, is_open: true,
  delivery_fee: 0, min_order: 0, avg_delivery_minutes: 40,
};

export default function RestaurantsPage() {
  const nav = useNavigate();
  const [items, setItems] = useState<Restaurant[]>([]);
  const [editing, setEditing] = useState<Partial<Restaurant> | null>(null);

  const load = () => get<Restaurant[]>("/admin/restaurants").then(setItems);
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    const body = { ...empty, ...editing };
    if (editing.id) await put(`/admin/restaurants/${editing.id}`, body);
    else await post("/admin/restaurants", body);
    setEditing(null);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Restoranlar</h1>
        <button className="btn" onClick={() => setEditing({ ...empty })}>+ Qo'shish</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="th">Nomi</th>
              <th className="th">Yetkazish</th>
              <th className="th">Min.</th>
              <th className="th">Holat</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td className="td font-medium">{r.name}</td>
                <td className="td">{r.delivery_fee.toLocaleString()}</td>
                <td className="td">{r.min_order.toLocaleString()}</td>
                <td className="td">
                  <span className={r.is_open ? "text-green-600" : "text-red-500"}>
                    {r.is_open ? "Ochiq" : "Yopiq"}
                  </span>
                </td>
                <td className="td text-right space-x-2 whitespace-nowrap">
                  <button className="text-brand" onClick={() => nav(`/restaurants/${r.id}/menu`)}>Menyu</button>
                  <button className="text-gray-600" onClick={() => setEditing(r)}>✎</button>
                  <button
                    className="text-red-500"
                    onClick={() => del(`/admin/restaurants/${r.id}`).then(load)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="card p-6 w-96 space-y-3">
            <h2 className="font-bold text-lg">{editing.id ? "Tahrirlash" : "Yangi restoran"}</h2>
            <input className="input" placeholder="Nomi" value={editing.name ?? ""}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <input className="input" placeholder="Tavsif (uz)" value={editing.description_uz ?? ""}
              onChange={(e) => setEditing({ ...editing, description_uz: e.target.value })} />
            <input className="input" placeholder="Описание (ru)" value={editing.description_ru ?? ""}
              onChange={(e) => setEditing({ ...editing, description_ru: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className="input" type="number" placeholder="Yetkazish" value={editing.delivery_fee ?? 0}
                onChange={(e) => setEditing({ ...editing, delivery_fee: +e.target.value })} />
              <input className="input" type="number" placeholder="Min. buyurtma" value={editing.min_order ?? 0}
                onChange={(e) => setEditing({ ...editing, min_order: +e.target.value })} />
            </div>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={editing.is_open ?? true}
                  onChange={(e) => setEditing({ ...editing, is_open: e.target.checked })} /> Ochiq
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={editing.is_active ?? true}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Faol
              </label>
            </div>
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
