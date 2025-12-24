import api from "./api";

export interface LoginCredentials {
  username: string; // Email do usuário
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface LoginResponse {
  user: any;
  access_token: string;
  token_type: string;
}

export const authService = {
  // Registrar novo usuário
  async register(data: RegisterData): Promise<User> {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // Fazer login (retorna token)
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    // Backend espera formato form-urlencoded
    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("username", credentials.email); // Backend usa 'username' mas aceita email
    formData.append("password", credentials.password);

    const response = await api.post("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  },

  // Salvar token no localStorage
  saveToken(token: string) {
    localStorage.setItem("access_token", token);
  },

  // Salvar usuário no localStorage
  saveUser(user: any) {
    localStorage.setItem("user", JSON.stringify(user));
  },

  // Obter token do localStorage
  getToken() {
    return localStorage.getItem("access_token");
  },

  // Obter usuário do localStorage
  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Verificar se está autenticado
  isAuthenticated() {
    return !!localStorage.getItem("access_token");
  },

  // Fazer logout
  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },

  // Obter perfil do usuário autenticado
  async getProfile(): Promise<User> {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Atualizar perfil
  async updateProfile(data: { full_name: string }): Promise<User> {
    const response = await api.put("/auth/me", data);
    return response.data;
  },

  // Trocar senha
  async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ message: string }> {
    const response = await api.post("/auth/change-password", data);
    return response.data;
  },
};