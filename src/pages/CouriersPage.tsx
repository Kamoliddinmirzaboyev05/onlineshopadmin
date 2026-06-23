import { CircleCheck, CircleX, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { del, get, post, put } from "../api";
import { TableSkeleton } from "../components/Skeleton";
import type { Courier } from "../types";

export default function CouriersPage() {
  const [items, setItems] = useState<Courier[]>([]);
  const [editing, setEditing] = useState<Partial<Courier> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => get<Courier[]>("/admin/couriers").then((d) => { setItems(d); setLoading(false); });
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

  const statusPill = (c: Courier) =>
    c.is_busy ? "bg-amber-100 text-amber-700"
      : c.is_active ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-100 text-slate-500";

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Kuryerlar</h1>
        <button className="btn" onClick={() => setEditing({ is_active: true })}><Plus size={18} /> Qo'shish</button>
      </div>

      {loading ? <TableSkeleton cols={5} /> : (
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="th">Ism</th>
              <th className="th">Telefon</th>
              <th className="th">Telegram ID</th>
              <th className="th">Holat</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/60">
                <td className="td font-medium text-slate-900">{c.name}</td>
                <td className="td">{c.phone ?? "—"}</td>
                <td className="td">{c.telegram_id ?? "—"}</td>
                <td className="td">
                  <span className={`pill ${statusPill(c)}`}>
                    {c.is_busy ? "Band" : c.is_active ? "Bo'sh" : "Nofaol"}
                  </span>
                </td>
                <td className="td text-right">
                  <div className="inline-flex items-center gap-1">
                    <button className="icon-btn" title="Tahrirlash" onClick={() => setEditing(c)}><Pencil size={16} /></button>
                    <button className="icon-btn hover:text-red-600" title="O'chirish" onClick={() => del(`/admin/couriers/${c.id}`).then(load)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="td text-center text-slate-400 py-10">Kuryerlar yo'q</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
              <button className="btn-ghost" onClick={() => setEditing(null)}><CircleX size={16} /> Bekor</button>
              <button className="btn" onClick={save}><CircleCheck size={16} /> Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
