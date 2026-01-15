import { create } from "zustand";

type User = {
  _id: string; // ✅ MUDEI DE id PARA _id
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  is_admin?: boolean;
  created_at: string;
} | null;

type AuthState = {
  user: User;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
};

// ✅ Função para carregar dados do localStorage
const getStoredAuth = (): { user: User; token: string | null } => {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }

  try {
    const token = localStorage.getItem("access_token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      return { user: null, token: null };
    }

    const user = JSON.parse(userStr);
    
    return { user, token };
  } catch (error) {
    console.error("❌ Erro ao carregar dados do localStorage:", error);
    return { user: null, token: null };
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  // ✅ Inicializar com dados do localStorage APENAS na criação
  ...getStoredAuth(),

  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }
    
    set({ user, token });
  },

  setUser: (user) => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    
    set({ user });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    
    set({ user: null, token: null });
  },
}));