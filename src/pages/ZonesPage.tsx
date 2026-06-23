import { useEffect, useState } from "react";
import { del, get, post, put } from "../api";
import type { DeliveryZone } from "../types";

export default function ZonesPage() {
  const [items, setItems] = useState<DeliveryZone[]>([]);
  const [editing, setEditing] = useState<Partial<DeliveryZone> | null>(null);

  const load = () => get<DeliveryZone[]>("/admin/zones").then(setItems);
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    const body = {
      name: editing.name ?? "",
      fee: editing.fee ?? 0,
      min_order: editing.min_order ?? 0,
      is_active: editing.is_active ?? true,
      polygon: editing.polygon ?? null,
    };
    if (editing.id) await put(`/admin/zones/${editing.id}`, body);
    else await post("/admin/zones", body);
    setEditing(null);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Yetkazish hududlari</h1>
        <button className="btn" onClick={() => setEditing({ is_active: true, fee: 0, min_order: 0 })}>+ Qo'shish</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="th">Hudud</th>
              <th className="th">Narx</th>
              <th className="th">Min. buyurtma</th>
              <th className="th">Holat</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((z) => (
              <tr key={z.id}>
                <td className="td font-medium">{z.name}</td>
                <td className="td">{z.fee.toLocaleString()}</td>
                <td className="td">{z.min_order.toLocaleString()}</td>
                <td className="td">{z.is_active ? "✅" : "❌"}</td>
                <td className="td text-right space-x-2">
                  <button className="text-gray-600" onClick={() => setEditing(z)}>✎</button>
                  <button className="text-red-500" onClick={() => del(`/admin/zones/${z.id}`).then(load)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="card p-6 w-96 space-y-3">
            <h2 className="font-bold text-lg">{editing.id ? "Tahrirlash" : "Yangi hudud"}</h2>
            <input className="input" placeholder="Hudud nomi" value={editing.name ?? ""}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className="input" type="number" placeholder="Narx" value={editing.fee ?? 0}
                onChange={(e) => setEditing({ ...editing, fee: +e.target.value })} />
              <input className="input" type="number" placeholder="Min. buyurtma" value={editing.min_order ?? 0}
                onChange={(e) => setEditing({ ...editing, min_order: +e.target.value })} />
            </div>
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
