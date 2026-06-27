import { CircleCheck, CircleX, FolderTree, Pencil, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { del, get, post, put } from "../api";
import ImageUpload from "../components/ImageUpload";
import { ErrorRetry, TableSkeleton } from "../components/Skeleton";
import type { Category, Product, Restaurant } from "../types";

type Tab = "products" | "categories";
const money = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ");

const UNITS = [
  { value: "dona",   label: "Dona (шт)" },
  { value: "kg",     label: "Kilogram (кг)" },
  { value: "g",      label: "Gramm (г)" },
  { value: "litr",   label: "Litr (л)" },
  { value: "ml",     label: "Millilitr (мл)" },
  { value: "pachka", label: "Pachka (пачка)" },
  { value: "quti",   label: "Quti (коробка)" },
  { value: "xalta",  label: "Xalta (мешок)" },
  { value: "juft",   label: "Juft (пара)" },
  { value: "metr",   label: "Metr (м)" },
];

function numInput(val: number | undefined) {
  return val === 0 || val === undefined ? "" : String(val);
}
function parseNum(s: string) { return s === "" ? 0 : Number(s); }

export default function ProductsPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [storeId, setStoreId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [editCat, setEditCat] = useState<Partial<Category> | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [delProd, setDelProd] = useState<number | null>(null);
  const [delCat, setDelCat] = useState<number | null>(null);

  const loadData = async (sid: number) => {
    setErr(false);
    try {
      setCategories(await get<Category[]>(`/admin/restaurants/${sid}/categories`));
      setProducts(await get<Product[]>(`/admin/restaurants/${sid}/products`));
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
    }
  };

  const reload = () => {
    setErr(false);
    setLoading(true);
    get<Restaurant>("/admin/store")
      .then((s) => { setStoreId(s.id); loadData(s.id); })
      .catch(() => { setErr(true); setLoading(false); });
  };

  useEffect(() => { reload(); }, []);

  const saveProduct = async () => {
    if (!editing || !storeId || saving) return;
    setSaving(true);
    try {
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
        unit: editing.unit ?? "dona",
        low_stock_threshold: editing.low_stock_threshold ?? 10,
        is_available: editing.is_available ?? true,
        sort_order: editing.sort_order ?? 0,
      };
      if (editing.id) await put(`/admin/products/${editing.id}`, body);
      else await post("/admin/products", body);
      setEditing(null);
      await loadData(storeId);
    } finally {
      setSaving(false);
    }
  };

  const saveCat = async () => {
    if (!editCat || !storeId || !editCat.name_uz?.trim() || saving) return;
    setSaving(true);
    try {
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
      await loadData(storeId);
    } finally {
      setSaving(false);
    }
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
              onClick={() => setEditing({ category_id: categories[0]?.id, is_available: true, price: 0, cost: 0, stock: 0, unit: "dona", low_stock_threshold: 10 })}
            >
              <Plus size={18} /> Mahsulot qo'shish
            </button>
          </div>

          {err ? <ErrorRetry onRetry={reload} /> : loading ? <TableSkeleton cols={6} /> : (
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
                    <td className="td">{money(p.price)} so'm</td>
                    <td className="td">
                      {money(p.cost)} <span className="text-xs text-slate-400">({margin(p)}%)</span>
                    </td>
                    <td className="td">
                      <span className={p.stock <= p.low_stock_threshold ? "text-rose-600 font-semibold" : ""}>
                        {p.stock} <span className="text-xs text-slate-400">{p.unit}</span>
                      </span>
                    </td>
                    <td className="td">
                      {p.is_available
                        ? <CircleCheck size={18} className="text-emerald-600" />
                        : <CircleX size={18} className="text-slate-300" />}
                    </td>
                    <td className="td text-right">
                      <div className="inline-flex items-center gap-1">
                        {delProd === p.id ? (
                          <>
                            <button className="icon-btn text-red-600 hover:bg-red-50" title="Tasdiqlash"
                              onClick={() => storeId && del(`/admin/products/${p.id}`).then(() => { setDelProd(null); loadData(storeId); })}><CircleCheck size={16} /></button>
                            <button className="icon-btn" title="Bekor" onClick={() => setDelProd(null)}><CircleX size={16} /></button>
                          </>
                        ) : (
                          <>
                            <button className="icon-btn" title="Tahrirlash" onClick={() => setEditing(p)}><Pencil size={16} /></button>
                            <button className="icon-btn hover:text-red-600" title="O'chirish" onClick={() => setDelProd(p.id)}><Trash2 size={16} /></button>
                          </>
                        )}
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

          {err ? <ErrorRetry onRetry={reload} /> : loading ? <TableSkeleton cols={3} /> : (
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
                        {delCat === c.id ? (
                          <>
                            <button className="icon-btn text-red-600 hover:bg-red-50" title="Tasdiqlash"
                              onClick={() => storeId && del(`/admin/categories/${c.id}`).then(() => { setDelCat(null); loadData(storeId); })}><CircleCheck size={16} /></button>
                            <button className="icon-btn" title="Bekor" onClick={() => setDelCat(null)}><CircleX size={16} /></button>
                          </>
                        ) : (
                          <>
                            <button className="icon-btn" title="Tahrirlash" onClick={() => setEditCat(c)}><Pencil size={16} /></button>
                            <button className="icon-btn hover:text-red-600" title="O'chirish" onClick={() => setDelCat(c.id)}><Trash2 size={16} /></button>
                          </>
                        )}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="px-7 pt-7 pb-4 border-b border-slate-100">
              <h2 className="font-bold text-xl">{editing.id ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{editing.id ? `#${editing.id}` : "Barcha maydonlarni to'ldiring"}</p>
            </div>

            <div className="px-7 py-5 space-y-5">
              {/* Kategoriya */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategoriya</label>
                <select className="input" value={editing.category_id}
                  onChange={(e) => setEditing({ ...editing, category_id: +e.target.value })}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name_uz}</option>)}
                </select>
              </div>

              {/* Nomlar */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomi (uz)</label>
                  <input className="input" placeholder="Masalan: Olma" value={editing.name_uz ?? ""}
                    onChange={(e) => setEditing({ ...editing, name_uz: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Название (ru)</label>
                  <input className="input" placeholder="Например: Яблоко" value={editing.name_ru ?? ""}
                    onChange={(e) => setEditing({ ...editing, name_ru: e.target.value })} />
                </div>
              </div>

              {/* Tasvir */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mahsulot rasmi</label>
                <ImageUpload
                  label=""
                  value={editing.image_url}
                  heightClass="h-36"
                  onChange={(url) => setEditing({ ...editing, image_url: url })}
                />
              </div>

              {/* Narx, Tannarx, O'lchov birligi */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Narx va o'lchov</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Sotuv narxi (so'm)</label>
                    <input className="input" type="number" min="0" placeholder="0"
                      value={numInput(editing.price)}
                      onChange={(e) => setEditing({ ...editing, price: parseNum(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Tannarx (so'm)</label>
                    <input className="input" type="number" min="0" placeholder="0"
                      value={numInput(editing.cost)}
                      onChange={(e) => setEditing({ ...editing, cost: parseNum(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">O'lchov birligi</label>
                    <select className="input" value={editing.unit ?? "dona"}
                      onChange={(e) => setEditing({ ...editing, unit: e.target.value })}>
                      {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                  </div>
                </div>
                {(editing.price ?? 0) > 0 && (editing.cost ?? 0) > 0 && (
                  <p className="text-xs text-slate-400 mt-2">
                    Margin: {Math.round(((editing.price! - editing.cost!) / editing.price!) * 100)}% · Foyda: {money(editing.price! - editing.cost!)} so'm / {editing.unit ?? "dona"}
                  </p>
                )}
              </div>

              {/* Ombor */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Ombor</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Qoldiq ({editing.unit ?? "dona"})</label>
                    <input className="input" type="number" min="0" placeholder="0"
                      value={numInput(editing.stock)}
                      onChange={(e) => setEditing({ ...editing, stock: parseNum(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Kam qoldiq chegarasi ({editing.unit ?? "dona"})</label>
                    <input className="input" type="number" min="0" placeholder="10"
                      value={numInput(editing.low_stock_threshold)}
                      onChange={(e) => setEditing({ ...editing, low_stock_threshold: parseNum(e.target.value) })} />
                  </div>
                </div>
              </div>

              {/* Tavsif */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tavsif (uz)</label>
                  <textarea className="input resize-none h-20" placeholder="Ixtiyoriy..."
                    value={editing.description_uz ?? ""}
                    onChange={(e) => setEditing({ ...editing, description_uz: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Описание (ru)</label>
                  <textarea className="input resize-none h-20" placeholder="Необязательно..."
                    value={editing.description_ru ?? ""}
                    onChange={(e) => setEditing({ ...editing, description_ru: e.target.value })} />
                </div>
              </div>

              {/* Mavjudlik */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" checked={editing.is_available ?? true}
                    onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })} />
                  <div className="w-10 h-6 bg-slate-200 peer-checked:bg-brand rounded-full transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <span className="text-sm font-medium text-slate-700">Sotuvda mavjud</span>
              </label>
            </div>

            <div className="px-7 py-4 border-t border-slate-100 flex gap-3 justify-end bg-slate-50/60 rounded-b-2xl">
              <button className="btn-ghost" onClick={() => setEditing(null)} disabled={saving}><CircleX size={16} /> Bekor</button>
              <button className="btn px-6" onClick={saveProduct} disabled={saving}>
                <CircleCheck size={16} /> {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORY MODAL ───────────────────────────────── */}
      {editCat && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-lg">
            <div className="px-7 pt-7 pb-4 border-b border-slate-100">
              <h2 className="font-bold text-xl">{editCat.id ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}</h2>
            </div>
            <div className="px-7 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomi (uz)</label>
                  <input className="input" placeholder="Masalan: Mevalar" value={editCat.name_uz ?? ""}
                    onChange={(e) => setEditCat({ ...editCat, name_uz: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Название (ru)</label>
                  <input className="input" placeholder="Например: Фрукты" value={editCat.name_ru ?? ""}
                    onChange={(e) => setEditCat({ ...editCat, name_ru: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategoriya rasmi</label>
                <ImageUpload
                  label=""
                  value={editCat.image_url}
                  heightClass="h-32"
                  onChange={(url) => setEditCat({ ...editCat, image_url: url })}
                />
              </div>
            </div>
            <div className="px-7 py-4 border-t border-slate-100 flex gap-3 justify-end bg-slate-50/60 rounded-b-2xl">
              <button className="btn-ghost" onClick={() => setEditCat(null)} disabled={saving}><CircleX size={16} /> Bekor</button>
              <button className="btn px-6" onClick={saveCat} disabled={saving}>
                <CircleCheck size={16} /> {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
