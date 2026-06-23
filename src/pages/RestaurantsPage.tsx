import { CircleCheck, CircleX, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { del, get, post, put } from "../api";
import { TableSkeleton } from "../components/Skeleton";
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
  const [loading, setLoading] = useState(true);

  const load = () => get<Restaurant[]>("/admin/restaurants").then((d) => { setItems(d); setLoading(false); });
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
        <h1 className="text-2xl font-bold tracking-tight">Restoranlar</h1>
        <button className="btn" onClick={() => setEditing({ ...empty })}><Plus size={18} /> Qo'shish</button>
      </div>

      {loading ? <TableSkeleton cols={5} /> : (
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="th">Nomi</th>
              <th className="th">Yetkazish</th>
              <th className="th">Min.</th>
              <th className="th">Holat</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60">
                <td className="td font-medium text-slate-900">{r.name}</td>
                <td className="td">{r.delivery_fee.toLocaleString()}</td>
                <td className="td">{r.min_order.toLocaleString()}</td>
                <td className="td">
                  <span className={`pill ${r.is_open ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {r.is_open ? "Ochiq" : "Yopiq"}
                  </span>
                </td>
                <td className="td text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <button className="text-brand text-sm font-medium px-2 hover:underline" onClick={() => nav(`/restaurants/${r.id}/menu`)}>Menyu</button>
                    <button className="icon-btn" title="Tahrirlash" onClick={() => setEditing(r)}><Pencil size={16} /></button>
                    <button className="icon-btn hover:text-red-600" title="O'chirish" onClick={() => del(`/admin/restaurants/${r.id}`).then(load)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="td text-center text-slate-400 py-10">Restoranlar yo'q</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={editing.is_open ?? true}
                  onChange={(e) => setEditing({ ...editing, is_open: e.target.checked })} /> Ochiq
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={editing.is_active ?? true}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Faol
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn-ghost" onClick={() => setEditing(null)}><CircleX size={16} /> Bekor</button>
              <button className="btn" onClick={save}><CircleCheck size={16} /> Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
