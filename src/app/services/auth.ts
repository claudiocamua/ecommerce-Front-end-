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
      localStorage.setItem("access_token", token);
    }
  }

  saveUser(user: User) {
    useAuthStore.getState().setUser(user);
  }

  getToken(): string | null {
    return useAuthStore.getState().token;
  }

  getUser(): User | null {
    return useAuthStore.getState().user;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    useAuthStore.getState().logout();
  }

  async loginWithGoogle(googleToken: string) {
    try {
      const response = await api.post("/auth/google", { token: googleToken });
      const { user, access_token } = response.data;
      
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
