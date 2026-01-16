import api from "./api";
import { useAuthStore } from "@/store/useAuthStore";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface User {
  _id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  is_admin?: boolean;
  created_at: string;
}

class AuthService {
  async login(data: LoginData) {
    const response = await api.post("/auth/login", data);
    
    const { access_token, user } = response.data;
    
    // ✅ SALVAR NO LOCALSTORAGE
    if (typeof window !== "undefined") {
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
    }
    
    if (user) {
      useAuthStore.getState().setAuth(user, access_token);
    } else {
      const userProfile = await this.getProfile(access_token);
      useAuthStore.getState().setAuth(userProfile, access_token);
    }
    
    return response.data;
  }

  async register(data: RegisterData) {
    const response = await api.post("/auth/register", data);
    return response.data;
  }

  async getProfile(token?: string): Promise<User> {
    const authToken = token || useAuthStore.getState().token;
    
    const response = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    return response.data;
  }

  saveToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
    useAuthStore.getState().setAuth(useAuthStore.getState().user, token);
  }

  saveUser(user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
    useAuthStore.getState().setUser(user);
  }

  getToken(): string | null {
    const zustandToken = useAuthStore.getState().token;
    if (zustandToken) return zustandToken;

    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  getUser(): User | null {
    const zustandUser = useAuthStore.getState().user;
    if (zustandUser) return zustandUser;

    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    useAuthStore.getState().logout();
  }

  async loginWithGoogle(googleToken: string) {
    try {
      const response = await api.post("/auth/google", { token: googleToken });
      const { user, access_token } = response.data;
      
      if (typeof window !== "undefined") {
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
      }
      
      useAuthStore.getState().setAuth(user, access_token);
      
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      }
      
      return { user, token: access_token };
    } catch (error) {
      console.error("❌ Erro no login com Google:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();