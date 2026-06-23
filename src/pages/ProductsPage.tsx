import { CircleCheck, CircleX, FolderTree, Pencil, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { del, get, post, put } from "../api";
import ImageUpload from "../components/ImageUpload";
import { TableSkeleton } from "../components/Skeleton";
import type { Category, Product, Restaurant } from "../types";

type Tab = "products" | "categories";
const money = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ");

export default function ProductsPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [storeId, setStoreId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [editCat, setEditCat] = useState<Partial<Category> | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async (sid: number) => {
    setCategories(await get<Category[]>(`/admin/restaurants/${sid}/categories`));
    setProducts(await get<Product[]>(`/admin/restaurants/${sid}/products`));
    setLoading(false);
  };

  useEffect(() => {
    get<Restaurant>("/admin/store").then((s) => { setStoreId(s.id); loadData(s.id); });
  }, []);

  const saveProduct = async () => {
    if (!editing || !storeId) return;
    const body = {
      restaurant_id: storeId,
      category_id: editing.category_id,
      name_uz: editing.name_uz ?? "",
      name_ru: editing.name_ru ?? editing.name_uz ?? "",
      description_uz: editing.description_uz ?? "",
      description_ru: editing.description_ru ?? "",
      image_url: editing.image_url ?? null,
      price: editing.price ?? 0,
      cost: editing.cost ?? 0,
      stock: editing.stock ?? 0,
      low_stock_threshold: editing.low_stock_threshold ?? 10,
      is_available: editing.is_available ?? true,
      sort_order: editing.sort_order ?? 0,
    };
    if (editing.id) await put(`/admin/products/${editing.id}`, body);
    else await post("/admin/products", body);
    setEditing(null);
    loadData(storeId);
  };

  const saveCat = async () => {
    if (!editCat || !storeId || !editCat.name_uz?.trim()) return;
    const body = {
      restaurant_id: storeId,
      name_uz: editCat.name_uz,
      name_ru: editCat.name_ru || editCat.name_uz,
      image_url: editCat.image_url ?? null,
      sort_order: editCat.sort_order ?? categories.length,
    };
    if (editCat.id) await put(`/admin/categories/${editCat.id}`, body);
    else await post("/admin/categories", body);
    setEditCat(null);
    loadData(storeId);
  };

  const catName = (id: number) => categories.find((c) => c.id === id)?.name_uz ?? "—";
  const margin = (p: Product) => (p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Mahsulotlar</h1>
      <p className="text-slate-500 mb-5">Mahsulotlar va kategoriyalarni boshqarish.</p>

      <div className="flex gap-2 mb-5">
        <button
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "products" ? "bg-brand text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          onClick={() => setTab("products")}
        ><ShoppingBasket size={16} /> Mahsulotlar</button>
        <button
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "categories" ? "bg-brand text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          onClick={() => setTab("categories")}
        ><FolderTree size={16} /> Kategoriyalar</button>
      </div>

      {/* ── PRODUCTS ─────────────────────────────────────── */}
      {tab === "products" && (
        <>
          <div className="flex justify-end mb-4">
            <button
              className="btn"
              disabled={categories.length === 0}
              title={categories.length === 0 ? "Avval kategoriya qo'shing" : ""}
              onClick={() => setEditing({ category_id: categories[0]?.id, is_available: true, price: 0, cost: 0, stock: 0, low_stock_threshold: 10 })}
            >
              <Plus size={18} /> Mahsulot qo'shish
            </button>
          </div>

          {loading ? <TableSkeleton cols={6} /> : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="th">Mahsulot</th>
                  <th className="th">Kategoriya</th>
                  <th className="th">Narx</th>
                  <th className="th">Tannarx</th>
                  <th className="th">Qoldiq</th>
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
                    <td className="td">{catName(p.category_id)}</td>
                    <td className="td">{money(p.price)}</td>
                    <td className="td">
                      {money(p.cost)} <span className="text-xs text-slate-400">({margin(p)}%)</span>
                    </td>
                    <td className="td">
                      <span className={p.stock <= p.low_stock_threshold ? "text-rose-600 font-semibold" : ""}>{p.stock}</span>
                    </td>
                    <td className="td">
                      {p.is_available
                        ? <CircleCheck size={18} className="text-emerald-600" />
                        : <CircleX size={18} className="text-slate-300" />}
                    </td>
                    <td className="td text-right">
                      <div className="inline-flex items-center gap-1">
                        <button className="icon-btn" title="Tahrirlash" onClick={() => setEditing(p)}><Pencil size={16} /></button>
                        <button className="icon-btn hover:text-red-600" title="O'chirish" onClick={() => storeId && del(`/admin/products/${p.id}`).then(() => loadData(storeId))}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={7} className="td text-center text-slate-400 py-10">
                    {categories.length === 0 ? "Avval kategoriya qo'shing" : "Mahsulot yo'q"}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </>
      )}

      {/* ── CATEGORIES ───────────────────────────────────── */}
      {tab === "categories" && (
        <>
          <div className="flex justify-end mb-4">
            <button className="btn" onClick={() => setEditCat({})}><Plus size={18} /> Kategoriya qo'shish</button>
          </div>

          {loading ? <TableSkeleton cols={3} /> : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="th">Nomi (uz)</th>
                  <th className="th">Название (ru)</th>
                  <th className="th">Mahsulotlar</th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="td font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        {c.image_url
                          ? <img src={c.image_url} alt="" className="h-9 w-12 rounded-lg object-cover bg-slate-100" />
                          : <span className="h-9 w-12 rounded-lg bg-slate-100" />}
                        {c.name_uz}
                      </div>
                    </td>
                    <td className="td">{c.name_ru}</td>
                    <td className="td">{products.filter((p) => p.category_id === c.id).length}</td>
                    <td className="td text-right">
                      <div className="inline-flex items-center gap-1">
                        <button className="icon-btn" title="Tahrirlash" onClick={() => setEditCat(c)}><Pencil size={16} /></button>
                        <button className="icon-btn hover:text-red-600" title="O'chirish" onClick={() => storeId && del(`/admin/categories/${c.id}`).then(() => loadData(storeId))}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={4} className="td text-center text-slate-400 py-10">Kategoriya yo'q — "Qo'shish" bilan qo'shing</td></tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </>
      )}

      {/* ── PRODUCT MODAL ────────────────────────────────── */}
      {editing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-[26rem] max-h-[90vh] overflow-auto space-y-3">
            <h2 className="font-bold text-lg">{editing.id ? "Tahrirlash" : "Yangi mahsulot"}</h2>
            <select className="input" value={editing.category_id}
              onChange={(e) => setEditing({ ...editing, category_id: +e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name_uz}</option>)}
            </select>
            <input className="input" placeholder="Nomi (uz)" value={editing.name_uz ?? ""}
              onChange={(e) => setEditing({ ...editing, name_uz: e.target.value })} />
            <input className="input" placeholder="Название (ru)" value={editing.name_ru ?? ""}
              onChange={(e) => setEditing({ ...editing, name_ru: e.target.value })} />
            <ImageUpload
              label="Mahsulot rasmi"
              value={editing.image_url}
              heightClass="h-28"
              onChange={(url) => setEditing({ ...editing, image_url: url })}
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-slate-500">Sotuv narxi (so'm)</span>
                <input className="input mt-1" type="number" value={editing.price ?? 0}
                  onChange={(e) => setEditing({ ...editing, price: +e.target.value })} />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500">Tannarx (so'm)</span>
                <input className="input mt-1" type="number" value={editing.cost ?? 0}
                  onChange={(e) => setEditing({ ...editing, cost: +e.target.value })} />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500">Ombor qoldig'i</span>
                <input className="input mt-1" type="number" value={editing.stock ?? 0}
                  onChange={(e) => setEditing({ ...editing, stock: +e.target.value })} />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500">Kam qoldiq chegarasi</span>
                <input className="input mt-1" type="number" value={editing.low_stock_threshold ?? 10}
                  onChange={(e) => setEditing({ ...editing, low_stock_threshold: +e.target.value })} />
              </label>
            </div>
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

      {/* ── CATEGORY MODAL ───────────────────────────────── */}
      {editCat && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-96 space-y-3">
            <h2 className="font-bold text-lg">{editCat.id ? "Tahrirlash" : "Yangi kategoriya"}</h2>
            <input className="input" placeholder="Nomi (uz) — masalan: Mevalar" value={editCat.name_uz ?? ""}
              onChange={(e) => setEditCat({ ...editCat, name_uz: e.target.value })} />
            <input className="input" placeholder="Название (ru) — например: Фрукты" value={editCat.name_ru ?? ""}
              onChange={(e) => setEditCat({ ...editCat, name_ru: e.target.value })} />
            <ImageUpload
              label="Kategoriya rasmi (kartochka foni)"
              value={editCat.image_url}
              heightClass="h-28"
              onChange={(url) => setEditCat({ ...editCat, image_url: url })}
            />
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn-ghost" onClick={() => setEditCat(null)}><CircleX size={16} /> Bekor</button>
              <button className="btn" onClick={saveCat}><CircleCheck size={16} /> Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
