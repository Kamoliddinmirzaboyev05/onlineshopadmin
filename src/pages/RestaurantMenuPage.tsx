import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { del, get, post, put } from "../api";
import type { Category, Product } from "../types";

export default function RestaurantMenuPage() {
  const { id } = useParams();
  const rid = Number(id);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [newCat, setNewCat] = useState({ uz: "", ru: "" });

  const load = async () => {
    setCategories(await get<Category[]>(`/admin/restaurants/${rid}/categories`));
    setProducts(await get<Product[]>(`/admin/restaurants/${rid}/products`));
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
      <h1 className="text-2xl font-bold mb-5">Menyu boshqaruvi</h1>

      {/* categories */}
      <div className="card p-4 mb-6">
        <h2 className="font-semibold mb-3">Kategoriyalar</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((c) => (
            <span key={c.id} className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-2">
              {c.name_uz}
              <button className="text-red-500" onClick={() => del(`/admin/categories/${c.id}`).then(load)}>×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input" placeholder="Kategoriya (uz)" value={newCat.uz}
            onChange={(e) => setNewCat({ ...newCat, uz: e.target.value })} />
          <input className="input" placeholder="Категория (ru)" value={newCat.ru}
            onChange={(e) => setNewCat({ ...newCat, ru: e.target.value })} />
          <button className="btn whitespace-nowrap" onClick={addCategory}>+ Qo'shish</button>
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
          + Mahsulot
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="th">Nomi</th>
              <th className="th">Kategoriya</th>
              <th className="th">Narx</th>
              <th className="th">Mavjud</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="td font-medium">{p.name_uz}</td>
                <td className="td">{categories.find((c) => c.id === p.category_id)?.name_uz ?? "—"}</td>
                <td className="td">{p.price.toLocaleString()}</td>
                <td className="td">{p.is_available ? "✅" : "❌"}</td>
                <td className="td text-right space-x-2">
                  <button className="text-gray-600" onClick={() => setEditing(p)}>✎</button>
                  <button className="text-red-500" onClick={() => del(`/admin/products/${p.id}`).then(load)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
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
            <input className="input" type="number" placeholder="Narx" value={editing.price ?? 0}
              onChange={(e) => setEditing({ ...editing, price: +e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.is_available ?? true}
                onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })} /> Mavjud
            </label>
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn-ghost" onClick={() => setEditing(null)}>Bekor</button>
              <button className="btn" onClick={saveProduct}>Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
