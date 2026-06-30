import { Ban, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { del, get, patch } from "../api";
import { ErrorRetry, TableSkeleton } from "../components/Skeleton";

interface UserRow {
  id: number;
  telegram_id: number;
  username?: string | null;
  first_name?: string | null;
  phone?: string | null;
  language: string;
  is_blocked: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  const load = () => {
    setErr(false);
    setLoading(true);
    get<UserRow[]>("/admin/users")
      .then((d) => { setItems(d); setLoading(false); })
      .catch(() => { setErr(true); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const toggleBlock = async (u: UserRow) => {
    setBusy(u.id);
    try {
      const updated = await patch<UserRow>(`/admin/users/${u.id}/block`, {
        blocked: !u.is_blocked,
      });
      setItems((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch {
      alert("Amalni bajarib bo'lmadi");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (u: UserRow) => {
    const label = u.first_name || u.username || `#${u.id}`;
    if (!confirm(`"${label}" foydalanuvchini butunlay o'chirasizmi?\nBarcha buyurtmalari ham o'chadi. Bu amalni qaytarib bo'lmaydi.`)) return;
    setBusy(u.id);
    try {
      await del(`/admin/users/${u.id}`);
      setItems((prev) => prev.filter((x) => x.id !== u.id));
    } catch {
      alert("O'chirib bo'lmadi");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-5">Foydalanuvchilar</h1>
      {err ? <ErrorRetry onRetry={load} /> : loading ? <TableSkeleton cols={6} /> : (
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="th">Ism</th>
              <th className="th">Username</th>
              <th className="th">Telefon</th>
              <th className="th">Til</th>
              <th className="th">Ro'yxatdan o'tgan</th>
              <th className="th text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr
                key={u.id}
                className={u.is_blocked ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-slate-50/60"}
              >
                <td className="td font-medium text-slate-900">
                  <span className="inline-flex items-center gap-2">
                    {u.first_name ?? "—"}
                    {u.is_blocked && (
                      <span className="text-[11px] font-semibold text-red-600 bg-red-100 rounded-full px-2 py-0.5">
                        Bloklangan
                      </span>
                    )}
                  </span>
                </td>
                <td className="td">{u.username ? `@${u.username}` : "—"}</td>
                <td className="td">{u.phone ?? "—"}</td>
                <td className="td uppercase">{u.language}</td>
                <td className="td">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="td">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleBlock(u)}
                      disabled={busy === u.id}
                      title={u.is_blocked ? "Blokdan chiqarish" : "Bloklash"}
                      className={`inline-flex items-center gap-1 text-xs font-medium rounded-lg px-2.5 py-1.5 disabled:opacity-50 ${
                        u.is_blocked
                          ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          : "text-amber-700 bg-amber-50 hover:bg-amber-100"
                      }`}
                    >
                      {u.is_blocked ? <ShieldCheck size={14} /> : <Ban size={14} />}
                      {u.is_blocked ? "Blokdan chiqar" : "Bloklash"}
                    </button>
                    <button
                      onClick={() => remove(u)}
                      disabled={busy === u.id}
                      title="O'chirish"
                      className="inline-flex items-center gap-1 text-xs font-medium rounded-lg px-2.5 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 size={14} /> O'chirish
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
