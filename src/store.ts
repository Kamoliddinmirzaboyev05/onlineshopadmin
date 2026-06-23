import { create } from "zustand";
import { get, post, setToken } from "./api";
import type { AdminUser } from "./types";

interface AuthState {
  admin: AdminUser | null;
  login: (username: string, password: string) => Promise<void>;
  loadMe: () => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  admin: null,
  login: async (username, password) => {
    const res = await post<{ access_token: string }>("/admin/auth/login", { username, password });
    setToken(res.access_token);
    const me = await get<AdminUser>("/admin/auth/me");
    set({ admin: me });
  },
  loadMe: async () => {
    try {
      const me = await get<AdminUser>("/admin/auth/me");
      set({ admin: me });
    } catch {
      set({ admin: null });
    }
  },
  logout: () => {
    setToken(null);
    set({ admin: null });
  },
}));
