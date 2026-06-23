import { CircleCheck, CircleX, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { del, get, post, put } from "../api";
import { TableSkeleton } from "../components/Skeleton";
import type { Category, Restaurant } from "../types";

export default function CategoriesPage() {
  const [storeId, setStoreId] = useState<number | null>(null);
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCats = (sid: number) =>
    get<Category[]>(`/admin/restaurants/${sid}/categories`).then((d) => { setItems(d); setLoading(false); });

  useEffect(() => {
    get<Restaurant>("/admin/store").then((s) => { setStoreId(s.id); loadCats(s.id); });
  }, []);

  const save = async () => {
    if (!editing || !storeId || !editing.name_uz?.trim()) return;
    const body = {
      restaurant_id: storeId,
      name_uz: editing.name_uz,
      name_ru: editing.name_ru || editing.name_uz,
      sort_order: editing.sort_order ?? items.length,
    };
    if (editing.id) await put(`/admin/categories/${editing.id}`, body);
    else await post("/admin/categories", body);
    setEditing(null);
    loadCats(storeId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl font-bold tracking-tight">Kategoriyalar</h1>
        <button className="btn" onClick={() => setEditing({})}><Plus size={18} /> Qo'shish</button>
      </div>
      <p className="text-slate-500 mb-5">Mevalar, sabzavotlar, shirinliklar, un va don, ko'katlar, ziravorlar…</p>

      {loading ? <TableSkeleton cols={3} /> : (
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="th">Nomi (uz)</th>
              <th className="th">Название (ru)</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/60">
                <td className="td font-medium text-slate-900">{c.name_uz}</td>
                <td className="td">{c.name_ru}</td>
                <td className="td text-right">
                  <div className="inline-flex items-center gap-1">
                    <button className="icon-btn" title="Tahrirlash" onClick={() => setEditing(c)}><Pencil size={16} /></button>
                    <button className="icon-btn hover:text-red-600" title="O'chirish" onClick={() => storeId && del(`/admin/categories/${c.id}`).then(() => loadCats(storeId))}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={3} className="td text-center text-slate-400 py-10">Kategoriya yo'q — "Qo'shish" bilan qo'shing</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-96 space-y-3">
            <h2 className="font-bold text-lg">{editing.id ? "Tahrirlash" : "Yangi kategoriya"}</h2>
            <input className="input" placeholder="Nomi (uz) — masalan: Mevalar" value={editing.name_uz ?? ""}
              onChange={(e) => setEditing({ ...editing, name_uz: e.target.value })} />
            <input className="input" placeholder="Название (ru) — например: Фрукты" value={editing.name_ru ?? ""}
              onChange={(e) => setEditing({ ...editing, name_ru: e.target.value })} />
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
