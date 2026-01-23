import api from "./api";

interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
}

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    if (response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("user_id", response.data.user_id);
      console.log("  [AUTH SERVICE] Token salvo:", response.data.access_token.substring(0, 20) + "...");
    }

    return response.data;
  },

  async register(userData: any) {
    const response = await api.post("/auth/register", userData);
    
    if (response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("user_id", response.data.user_id);
    }
    
    return response.data;
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user"); 
    console.log("  [AUTH SERVICE] Logout - localStorage limpo");
  },

  getToken() {
    const token = localStorage.getItem("access_token");
    console.log("  [AUTH SERVICE] getToken:", token ? token.substring(0, 20) + "..." : "null");
    return token;
  },

  isAuthenticated() {
    const hasToken = !!this.getToken();
    console.log("  [AUTH SERVICE] isAuthenticated:", hasToken);
    return hasToken;
  },

  async getProfile() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  saveToken(token: string) {
    localStorage.setItem("access_token", token);
    console.log("  [AUTH SERVICE] saveToken (OAuth):", token.substring(0, 20) + "...");
  },

  saveUser(user: any) {
    localStorage.setItem("user_id", user.id || user.user_id);
    localStorage.setItem("user", JSON.stringify(user)); 
    console.log("  [AUTH SERVICE] saveUser (OAuth):", user);
  },

  getUser() {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        console.log(" [AUTH SERVICE] User do localStorage:", user);
        return user;
      }
      return null;
    } catch (error) {
      console.error("  [AUTH SERVICE] Erro ao parsear user:", error);
      return null;
    }
  },
};