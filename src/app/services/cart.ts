import { authService } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CartItem {
  _id: string;
  product_id: string;
  quantity: number;
  product?: {
    name: string;
    price: number;
    image_url: string;
  };
}

export interface Cart {
  user_id: string;
  items: CartItem[];
  total: number;
}
// Serviço para gerenciar o carrinho de compras
export const cartService = {
  async addToCart(productId: string, quantity: number = 1) {
    if (!authService.isAuthenticated()) {
      throw new Error("Você precisa estar logado para adicionar produtos ao carrinho");
    }

    const token = authService.getToken();
    
    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    try {
      console.log(" Adicionando ao carrinho:", { productId, quantity });
      
      const response = await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao adicionar ao carrinho");
      }

      return await response.json();
    } catch (error: any) {
      console.error(" Erro ao adicionar ao carrinho:", error);
      throw error;
    }
  },

  async getCart() {
    if (!authService.isAuthenticated()) {
      return { items: [], total: 0 };
    }

    const token = authService.getToken();
    
    if (!token) {
      return { items: [], total: 0 };
    }

    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          return { items: [], total: 0 };
        }
        throw new Error("Erro ao buscar carrinho");
      }

      return await response.json();
    } catch (error) {
      console.error(" Erro ao buscar carrinho:", error);
      return { items: [], total: 0 };
    }
  },

  async updateCartItem(productId: string, quantity: number) {
    if (!authService.isAuthenticated()) {
      throw new Error("Você precisa estar logado");
    }

    const token = authService.getToken();

    try {
      const response = await fetch(`${API_URL}/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar item");
      }

      return await response.json();
    } catch (error) {
      console.error(" Erro ao atualizar item:", error);
      throw error;
    }
  },

  async removeFromCart(productId: string) {
    if (!authService.isAuthenticated()) {
      throw new Error("Você precisa estar logado");
    }

    const token = authService.getToken();

    try {
      const response = await fetch(`${API_URL}/cart/remove/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao remover item");
      }

      return await response.json();
    } catch (error) {
      console.error(" Erro ao remover item:", error);
      throw error;
    }
  },

  async clearCart() {
    if (!authService.isAuthenticated()) {
      throw new Error("Você precisa estar logado");
    }

    const token = authService.getToken();

    try {
      const response = await fetch(`${API_URL}/cart/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao limpar carrinho");
      }

      return await response.json();
    } catch (error) {
      console.error(" Erro ao limpar carrinho:", error);
      throw error;
    }
  },
};