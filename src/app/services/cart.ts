import api from "./api";

export interface CartItem {
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_price: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  total_price: number;
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
  // Adicionar item ao carrinho
  async addItem(product_id: string, quantity: number): Promise<Cart> {
    const response = await api.post("/cart/add", {
      product_id,
      quantity,
    });
    return response.data;
  },

  // Ver carrinho
  async getCart(): Promise<Cart> {
    const response = await api.get("/cart/");
    return response.data;
  },

  // Atualizar quantidade do item
  async updateItem(product_id: string, quantity: number): Promise<Cart> {
    const response = await api.put(`/cart/items/${product_id}`, {
      quantity,
    });
    return response.data;
  },

  // Remover item do carrinho
  async removeItem(product_id: string): Promise<Cart> {
    const response = await api.delete(`/cart/items/${product_id}`);
    return response.data;
  },

  // Limpar carrinho
  async clearCart(): Promise<{ message: string; items_removed: number }> {
    const response = await api.delete("/cart/clear");
    return response.data;
  },
};