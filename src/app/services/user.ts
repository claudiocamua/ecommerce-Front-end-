const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  address?: string;
}

export const userService = {
  async updateProfile(data: UpdateProfileData) {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("Usuário não autenticado");

    const response = await fetch(`${API_URL}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erro ao atualizar perfil");
    }

    return await response.json();
  },

  async getProfile() {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("Usuário não autenticado");

    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erro ao buscar perfil");
    }

    return await response.json();
  },
};