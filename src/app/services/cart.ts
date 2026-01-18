import api from "./api";

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

export const cartService = {
  async addToCart(product_id: string, quantity: number = 1) {
    console.log(" Adicionando ao carrinho:", { product_id, quantity });
    
    const response = await fetch("/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ product_id, quantity })
    });

    const data = await response.json();
    console.log(" Produto adicionado:", data);
    return data;
  },

  async getCart(): Promise<Cart> {
    console.log(" Buscando carrinho do usuário...");
    
    const response = await fetch("/api/cart/add", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(" Erro ao buscar carrinho:", error);
      throw new Error(error.message || "Erro ao buscar carrinho");
    }

    const data = await response.json();
    console.log(" Carrinho carregado:", data);
    return data;
  },
  
  async updateItem(product_id: string, quantity: number): Promise<Cart> {
    console.log(" Atualizando item:", { product_id, quantity });
    
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    const response = await fetch(`${BACKEND_URL}/cart/items/${product_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ quantity })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(" Erro ao atualizar:", error);
      
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      
      throw new Error(error.detail || "Erro ao atualizar quantidade");
    }

    const data = await response.json();
    console.log(" Item atualizado:", data);
    return data;
  },

  async removeItem(product_id: string): Promise<Cart> {
    console.log(" Removendo item:", product_id);
    
    // USAR FETCH DIRETO PARA O BACKEND
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    const response = await fetch(`${BACKEND_URL}/cart/items/${product_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(" Erro ao remover:", error);
      
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      
      throw new Error(error.detail || "Erro ao remover item");
    }

    const data = await response.json();
    console.log(" Item removido:", data);
    return data;
  },

  async clearCart(): Promise<void> {
    console.log(" Limpando carrinho...");
    
    // USAR FETCH DIRETO PARA O BACKEND
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    const response = await fetch(`${BACKEND_URL}/cart/clear`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(" Erro ao limpar carrinho:", error);
      
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      
      throw new Error(error.detail || "Erro ao limpar carrinho");
    }

    console.log(" Carrinho limpo!");
  },
};