import { AtSign, Camera, Globe, PlayCircle, Plus, Save, Send, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { get, put } from "../api";
import ImageUpload from "../components/ImageUpload";
import { ErrorRetry } from "../components/Skeleton";
import type { Restaurant } from "../types";

// Qo'llab-quvvatlanadigan ijtimoiy tarmoqlar (key backendda socials obyekti kaliti).
const SOCIALS: { key: string; label: string; icon: typeof Globe; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", icon: Camera, placeholder: "https://instagram.com/allfoods" },
  { key: "telegram", label: "Telegram", icon: Send, placeholder: "https://t.me/allfoods" },
  { key: "facebook", label: "Facebook", icon: AtSign, placeholder: "https://facebook.com/allfoods" },
  { key: "youtube", label: "YouTube", icon: PlayCircle, placeholder: "https://youtube.com/@allfoods" },
  { key: "website", label: "Veb-sayt", icon: Globe, placeholder: "https://allfoods.uz" },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [name, setName] = useState("");
  const [descUz, setDescUz] = useState("");
  const [descRu, setDescRu] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [owner, setOwner] = useState("");
  const [phones, setPhones] = useState<string[]>([""]);
  const [socials, setSocials] = useState<Record<string, string>>({});

  const load = () => {
    setErr(false);
    setLoading(true);
    get<Restaurant>("/admin/store")
      .then((s) => {
        setName(s.name ?? "");
        setDescUz(s.description_uz ?? "");
        setDescRu(s.description_ru ?? "");
        setLogo(s.logo_url ?? null);
        setCover(s.cover_url ?? null);
        setAddress(s.address ?? "");
        setOwner(s.owner_name ?? "");
        setPhones(s.phones?.length ? s.phones : [""]);
        setSocials(s.socials ?? {});
        setLoading(false);
      })
      .catch(() => { setErr(true); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const setPhone = (i: number, v: string) =>
    setPhones((p) => p.map((x, idx) => (idx === i ? v : x)));
  const addPhone = () => setPhones((p) => [...p, ""]);
  const removePhone = (i: number) =>
    setPhones((p) => (p.length === 1 ? [""] : p.filter((_, idx) => idx !== i)));

  const setSocial = (key: string, v: string) =>
    setSocials((s) => ({ ...s, [key]: v }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const cleanSocials = Object.fromEntries(
        Object.entries(socials).filter(([, v]) => v.trim()),
      );
      const updated = await put<Restaurant>("/admin/store", {
        name: name.trim(),
        description_uz: descUz.trim() || null,
        description_ru: descRu.trim() || null,
        logo_url: logo,
        cover_url: cover,
        address: address.trim() || null,
        owner_name: owner.trim() || null,
        phones: phones.map((p) => p.trim()).filter(Boolean),
        socials: cleanSocials,
      });
      setPhones(updated.phones?.length ? updated.phones : [""]);
      setSocials(updated.socials ?? {});
      setMsg({ ok: true, text: "Saqlandi ✓" });
    } catch {
      setMsg({ ok: false, text: "Saqlab bo'lmadi" });
    } finally {
      setSaving(false);
    }
  };

  if (err) return <ErrorRetry onRetry={load} />;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Do'kon sozlamalari</h1>
      <p className="text-slate-500 mb-5">Do'kon nomi, logosi, manzili va aloqa ma'lumotlari.</p>

      {loading ? (
        <div className="card p-6 text-slate-400">Yuklanmoqda…</div>
      ) : (
        <div className="space-y-4">
          {/* Brending */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-slate-800">Brending</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <ImageUpload label="Logo" value={logo} onChange={setLogo} heightClass="h-32" />
              <ImageUpload label="Muqova (cover)" value={cover} onChange={setCover} heightClass="h-32" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Do'kon nomi</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tavsif (uz)</label>
                <textarea className="input min-h-[80px]" value={descUz} onChange={(e) => setDescUz(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tavsif (ru)</label>
                <textarea className="input min-h-[80px]" value={descRu} onChange={(e) => setDescRu(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Aloqa */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-slate-800">Aloqa</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Manzil</label>
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Farg'ona sh., ..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ega (rahbar) ismi</label>
              <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefon raqamlari</label>
              <div className="space-y-2">
                {phones.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className="input flex-1"
                      value={p}
                      onChange={(e) => setPhone(i, e.target.value)}
                      placeholder="+998 90 123 45 67"
                    />
                    <button
                      type="button"
                      onClick={() => removePhone(i)}
                      className="icon-btn text-red-500 shrink-0"
                      title="O'chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addPhone} className="btn-ghost mt-2 text-sm">
                <Plus size={15} /> Raqam qo'shish
              </button>
            </div>
          </div>

          {/* Ijtimoiy tarmoqlar */}
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-slate-800">Ijtimoiy tarmoqlar</h2>
            {SOCIALS.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
                  <Icon size={15} /> {label}
                </label>
                <input
                  className="input"
                  value={socials[key] ?? ""}
                  onChange={(e) => setSocial(key, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>

          {msg && (
            <div className={`text-sm rounded-lg px-3 py-2 ${msg.ok ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"}`}>
              {msg.text}
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={save} disabled={saving || !name.trim()} className="btn">
              <Save size={16} /> {saving ? "Saqlanmoqda…" : "Saqlash"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
