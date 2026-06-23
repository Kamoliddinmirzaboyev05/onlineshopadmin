import { CircleCheck, CircleX, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { del, get, post, put } from "../api";
import { TableSkeleton } from "../components/Skeleton";
import type { Category, Product } from "../types";

export default function RestaurantMenuPage() {
  const { id } = useParams();
  const rid = Number(id);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [newCat, setNewCat] = useState({ uz: "", ru: "" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setCategories(await get<Category[]>(`/admin/restaurants/${rid}/categories`));
    setProducts(await get<Product[]>(`/admin/restaurants/${rid}/products`));
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [rid]);

  const addCategory = async () => {
    if (!newCat.uz.trim()) return;
    await post("/admin/categories", {
      restaurant_id: rid, name_uz: newCat.uz, name_ru: newCat.ru || newCat.uz, sort_order: categories.length,
    });
    setNewCat({ uz: "", ru: "" });
    load();
  };

  const saveProduct = async () => {
    if (!editing) return;
    const body = {
      restaurant_id: rid,
      category_id: editing.category_id,
      name_uz: editing.name_uz ?? "",
      name_ru: editing.name_ru ?? editing.name_uz ?? "",
      description_uz: editing.description_uz ?? "",
      description_ru: editing.description_ru ?? "",
      image_url: editing.image_url ?? null,
      price: editing.price ?? 0,
      is_available: editing.is_available ?? true,
      sort_order: editing.sort_order ?? 0,
    };
    if (editing.id) await put(`/admin/products/${editing.id}`, body);
    else await post("/admin/products", body);
    setEditing(null);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-5">Menyu boshqaruvi</h1>

      {/* categories */}
      <div className="card p-4 mb-6">
        <h2 className="font-semibold mb-3">Kategoriyalar</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((c) => (
            <span key={c.id} className="bg-slate-100 rounded-full pl-3 pr-1.5 py-1 text-sm flex items-center gap-1.5">
              {c.name_uz}
              <button className="grid place-items-center h-5 w-5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-red-500 transition" onClick={() => del(`/admin/categories/${c.id}`).then(load)}><X size={13} /></button>
            </span>
          ))}
          {categories.length === 0 && <span className="text-sm text-slate-400">Kategoriya yo'q</span>}
        </div>
        <div className="flex gap-2">
          <input className="input" placeholder="Kategoriya (uz)" value={newCat.uz}
            onChange={(e) => setNewCat({ ...newCat, uz: e.target.value })} />
          <input className="input" placeholder="Категория (ru)" value={newCat.ru}
            onChange={(e) => setNewCat({ ...newCat, ru: e.target.value })} />
          <button className="btn whitespace-nowrap" onClick={addCategory}><Plus size={18} /> Qo'shish</button>
        </div>
      </div>

      {/* products */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold">Mahsulotlar</h2>
        <button
          className="btn"
          disabled={categories.length === 0}
          onClick={() => setEditing({ category_id: categories[0]?.id, is_available: true, price: 0 })}
        >
          <Plus size={18} /> Mahsulot
        </button>
      </div>

      {loading ? <TableSkeleton cols={5} /> : (
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="th">Nomi</th>
              <th className="th">Kategoriya</th>
              <th className="th">Narx</th>
              <th className="th">Mavjud</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/60">
                <td className="td font-medium text-slate-900">
                  <div className="flex items-center gap-3">
                    {p.image_url
                      ? <img src={p.image_url} alt="" className="h-9 w-9 rounded-lg object-cover bg-slate-100" />
                      : <span className="h-9 w-9 rounded-lg bg-slate-100" />}
                    {p.name_uz}
                  </div>
                </td>
                <td className="td">{categories.find((c) => c.id === p.category_id)?.name_uz ?? "—"}</td>
                <td className="td">{p.price.toLocaleString()}</td>
                <td className="td">
                  {p.is_available
                    ? <CircleCheck size={18} className="text-emerald-600" />
                    : <CircleX size={18} className="text-slate-300" />}
                </td>
                <td className="td text-right">
                  <div className="inline-flex items-center gap-1">
                    <button className="icon-btn" title="Tahrirlash" onClick={() => setEditing(p)}><Pencil size={16} /></button>
                    <button className="icon-btn hover:text-red-600" title="O'chirish" onClick={() => del(`/admin/products/${p.id}`).then(load)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="td text-center text-slate-400 py-10">Mahsulotlar yo'q</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-96 space-y-3">
            <h2 className="font-bold text-lg">{editing.id ? "Tahrirlash" : "Yangi mahsulot"}</h2>
            <select className="input" value={editing.category_id}
              onChange={(e) => setEditing({ ...editing, category_id: +e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name_uz}</option>)}
            </select>
            <input className="input" placeholder="Nomi (uz)" value={editing.name_uz ?? ""}
              onChange={(e) => setEditing({ ...editing, name_uz: e.target.value })} />
            <input className="input" placeholder="Название (ru)" value={editing.name_ru ?? ""}
              onChange={(e) => setEditing({ ...editing, name_ru: e.target.value })} />
            <input className="input" placeholder="Rasm URL" value={editing.image_url ?? ""}
              onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
            {editing.image_url && (
              <img src={editing.image_url} alt="" className="h-24 w-full rounded-lg object-cover bg-slate-100" />
            )}
            <input className="input" type="number" placeholder="Narx" value={editing.price ?? 0}
              onChange={(e) => setEditing({ ...editing, price: +e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.is_available ?? true}
                onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })} /> Mavjud
            </label>
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn-ghost" onClick={() => setEditing(null)}><CircleX size={16} /> Bekor</button>
              <button className="btn" onClick={saveProduct}><CircleCheck size={16} /> Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
