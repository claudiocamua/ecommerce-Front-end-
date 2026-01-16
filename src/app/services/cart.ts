import api from "./api";

export interface CartItem {
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_price: number;
  quantity: number;
  subtotal: number;
  in_stock: boolean;
  available_stock: number;
}

export interface Cart {
  user_id: string;
  items: CartItem[];
  total_items: number;
  subtotal: number;
  updated_at: string;
}

export const cartService = {
  async addToCart(product_id: string, quantity: number = 1) {
    try {
      console.log("🛒 Adicionando ao carrinho:", { product_id, quantity });
      
      const response = await api.post("/cart/add", {
        product_id,
        quantity,
      });

      console.log("✅ Produto adicionado:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erro ao adicionar:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 401) {
        // ✅ TEMPORÁRIO: Só logar o erro, não redirecionar
        console.error("🔒 Token inválido ou expirado!");
        console.log("Token atual:", localStorage.getItem("token"));
        
        // ❌ COMENTADO TEMPORARIAMENTE
        // localStorage.removeItem("token");
        // localStorage.removeItem("user");
        // window.location.href = "/";
        
        throw new Error("Token inválido. Verifique o console!");
      }

      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.detail || "Produto já está no carrinho");
      }

      throw new Error(error.response?.data?.detail || "Erro ao adicionar ao carrinho");
    }
  },

  async getCart(): Promise<Cart> {
    try {
      console.log("📡 Buscando carrinho do usuário...");
      const response = await api.get("/cart/");
      console.log("✅ Carrinho recebido:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erro ao buscar carrinho:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 404 || error.response?.status === 401) {
        return {
          user_id: "",
          items: [],
          total_items: 0,
          subtotal: 0,
          updated_at: new Date().toISOString(),
        };
      }

      return {
        user_id: "",
        items: [],
        total_items: 0,
        subtotal: 0,
        updated_at: new Date().toISOString(),
      };
    }
  },

  async updateItem(product_id: string, quantity: number): Promise<Cart> {
    try {
      const response = await api.put(`/cart/items/${product_id}`, { quantity });
      return response.data;
    } catch (error: any) {
      console.error("❌ Erro ao atualizar:", error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";  // ✅ CORRIGIDO
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      
      throw new Error(error.response?.data?.detail || "Erro ao atualizar quantidade");
    }
  },

  async removeItem(product_id: string): Promise<Cart> {
    try {
      const response = await api.delete(`/cart/items/${product_id}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erro ao remover:", error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";  // ✅ CORRIGIDO
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      
      throw new Error(error.response?.data?.detail || "Erro ao remover item");
    }
  },

  async clearCart(): Promise<void> {
    try {
      await api.delete("/cart/clear");
    } catch (error: any) {
      console.error("❌ Erro ao limpar carrinho:", error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";  // ✅ CORRIGIDO
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      
      throw new Error(error.response?.data?.detail || "Erro ao limpar carrinho");
    }
  },
};