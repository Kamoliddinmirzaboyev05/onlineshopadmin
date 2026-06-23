import { AlertTriangle, Boxes, CircleCheck, CircleX, Package, PackagePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { get, patch } from "../api";
import { TableSkeleton } from "../components/Skeleton";
import type { Product, Restaurant } from "../types";

const money = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ");

export default function WarehousePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<{ id: number; name: string; stock: number; threshold: number } | null>(null);

  const load = async () => {
    const s = await get<Restaurant>("/admin/store");
    setProducts(await get<Product[]>(`/admin/restaurants/${s.id}/products`));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!edit) return;
    await patch(`/admin/products/${edit.id}/stock`, {
      stock: edit.stock,
      low_stock_threshold: edit.threshold,
    });
    setEdit(null);
    load();
  };

  const total = products.length;
  const low = products.filter((p) => p.stock <= p.low_stock_threshold && p.stock > 0).length;
  const out = products.filter((p) => p.stock <= 0).length;
  const stockValue = products.reduce((s, p) => s + p.stock * p.cost, 0);

  const sorted = [...products].sort((a, b) => a.stock - b.stock);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Ombor</h1>
      <p className="text-slate-500 mb-6">Qoldiqlarni boshqarish. Buyurtma yetkazilganda qoldiq avtomatik kamayadi.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card label="Mahsulotlar" value={String(total)} icon={Package} tint="bg-sky-50 text-sky-600" />
        <Card label="Kam qoldiq" value={String(low)} icon={AlertTriangle} tint="bg-amber-50 text-amber-600" />
        <Card label="Tugagan" value={String(out)} icon={CircleX} tint="bg-rose-50 text-rose-600" />
        <Card label="Ombor qiymati" value={`${money(stockValue)} so'm`} icon={Boxes} tint="bg-emerald-50 text-emerald-600" />
      </div>

      {loading ? <TableSkeleton cols={5} /> : (
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="th">Mahsulot</th>
              <th className="th">Qoldiq</th>
              <th className="th">Chegara</th>
              <th className="th">Holat</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const isOut = p.stock <= 0;
              const isLow = !isOut && p.stock <= p.low_stock_threshold;
              return (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="td font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      {p.image_url
                        ? <img src={p.image_url} alt="" className="h-9 w-9 rounded-lg object-cover bg-slate-100" />
                        : <span className="h-9 w-9 rounded-lg bg-slate-100" />}
                      {p.name_uz}
                    </div>
                  </td>
                  <td className="td">
                    <span className={isOut ? "text-rose-600 font-bold" : isLow ? "text-amber-600 font-semibold" : "font-medium"}>{p.stock}</span>
                  </td>
                  <td className="td text-slate-400">{p.low_stock_threshold}</td>
                  <td className="td">
                    {isOut ? <span className="pill bg-rose-100 text-rose-700">Tugagan</span>
                      : isLow ? <span className="pill bg-amber-100 text-amber-700">Kam qoldi</span>
                      : <span className="pill bg-emerald-100 text-emerald-700">Yetarli</span>}
                  </td>
                  <td className="td text-right">
                    <button className="btn-ghost !py-1.5 !px-3 text-sm"
                      onClick={() => setEdit({ id: p.id, name: p.name_uz, stock: p.stock, threshold: p.low_stock_threshold })}>
                      <PackagePlus size={15} /> Qoldiq
                    </button>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr><td colSpan={5} className="td text-center text-slate-400 py-10">Mahsulot yo'q</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {edit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-96 space-y-3">
            <h2 className="font-bold text-lg">Qoldiqni yangilash</h2>
            <p className="text-sm text-slate-500">{edit.name}</p>
            <label className="block">
              <span className="text-xs text-slate-500">Ombor qoldig'i</span>
              <input className="input mt-1" type="number" value={edit.stock}
                onChange={(e) => setEdit({ ...edit, stock: +e.target.value })} />
            </label>
            <div className="flex gap-2 flex-wrap">
              {[10, 50, 100].map((n) => (
                <button key={n} className="btn-ghost !py-1 !px-3 text-sm"
                  onClick={() => setEdit({ ...edit, stock: edit.stock + n })}>+{n}</button>
              ))}
            </div>
            <label className="block">
              <span className="text-xs text-slate-500">Kam qoldiq chegarasi</span>
              <input className="input mt-1" type="number" value={edit.threshold}
                onChange={(e) => setEdit({ ...edit, threshold: +e.target.value })} />
            </label>
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn-ghost" onClick={() => setEdit(null)}><CircleX size={16} /> Bekor</button>
              <button className="btn" onClick={save}><CircleCheck size={16} /> Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, icon: Icon, tint }: { label: string; value: string; icon: typeof Package; tint: string }) {
  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-2xl font-bold mt-1 tracking-tight">{value}</div>
      </div>
      <span className={`grid place-items-center h-10 w-10 rounded-lg ${tint}`}><Icon size={20} /></span>
    </div>
  );
}
