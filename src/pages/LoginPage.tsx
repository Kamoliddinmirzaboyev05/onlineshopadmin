import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      nav("/");
    } catch {
      setError("Login yoki parol xato");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="card p-8 w-80 space-y-4">
        <h1 className="text-2xl font-bold text-brand text-center">All Foods Admin</h1>
        <input
          className="input"
          placeholder="Login"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="btn w-full" disabled={loading}>
          {loading ? "…" : "Kirish"}
        </button>
      </form>
    </div>
  );
}
