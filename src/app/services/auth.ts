import api from "./api";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user?: any;
}

class AuthService {
  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    const { access_token, user } = response.data;

    const userData = {
      ...user,
      is_admin: user.is_admin === true || user.is_admin === "true",
    };

    console.log(" [LOGIN] User do backend:", user);
    console.log(" [LOGIN] is_admin original:", user.is_admin);
    console.log(" [LOGIN] User convertido:", userData);

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("user", JSON.stringify(userData));

    return { access_token, user: userData };
  }

  async getProfile() {
    const response = await api.get("/auth/me");
    return response.data;
  }

  saveToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  }

  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  }

  saveUser(user: any) {
    if (typeof window !== "undefined") {
      const userData = {
        ...user,
        is_admin: user.is_admin === true || user.is_admin === "true",
      };
      localStorage.setItem("user", JSON.stringify(userData));
    }
  }

  getUser() {
    if (typeof window === "undefined") return null;

    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);

      //CONVERTER is_admin PARA BOOLEAN VERDADEIRO
      const isAdmin = user.is_admin === true || user.is_admin === "true";

      console.log(" [AUTH SERVICE] User do localStorage:", user);
      console.log(" [AUTH SERVICE] is_admin ORIGINAL:", user.is_admin);
      console.log(" [AUTH SERVICE] Tipo ORIGINAL:", typeof user.is_admin);
      console.log(" [AUTH SERVICE] isAdmin CONVERTIDO:", isAdmin);

      return {
        ...user,
        is_admin: isAdmin,
      };
    } catch (error) {
      console.error(" Erro ao parsear usuário:", error);
      return null;
    }
  }

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  }

  isAuthenticated() {
    const token = this.getToken();
    console.log(" [AUTH] isAuthenticated - Token:", !!token);
    return !!token;
  }

  async register(data: {
    email: string;
    password: string;
    full_name: string;
  }): Promise<{ access_token: string; user: any }> {
    try {
      const response = await api.post("/auth/register", data);

      // Salvar token e usuário
      if (response.data.access_token) {
        this.saveToken(response.data.access_token);
        this.saveUser(response.data.user);
      }

      return response.data;
    } catch (error: any) {
      console.error("Erro ao registrar:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();