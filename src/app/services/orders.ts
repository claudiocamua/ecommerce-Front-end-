import { authService } from "./auth";

export interface Order {
  _id?: string;
  id?: string;
  user_id: string;
  items: Array<{
    product_id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_method: "credit_card" | "debit_card" | "pix" | "boleto";
  shipping_address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  created_at?: string;
  updated_at?: string;
}

export const ordersService = {
  async createOrder(orderData: Omit<Order, "_id" | "id" | "created_at" | "updated_at">): Promise<Order> {
    const token = authService.getToken();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const res = await fetch(`${baseURL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Erro ao criar pedido");
    }

    return res.json();
  },

  async getMyOrders(): Promise<Order[]> {
    const token = authService.getToken();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const res = await fetch(`${baseURL}/orders/my-orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Erro ao buscar pedidos");
    }

    return res.json();
  },

  async getOrderById(orderId: string): Promise<Order> {
    const token = authService.getToken();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const res = await fetch(`${baseURL}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Erro ao buscar pedido");
    }

    return res.json();
  },

  async getAllOrders(): Promise<Order[]> {
    const token = authService.getToken();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const res = await fetch(`${baseURL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Erro ao buscar pedidos");
    }

    return res.json();
  },

  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<Order> {
    const token = authService.getToken();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const res = await fetch(`${baseURL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      throw new Error("Erro ao atualizar status do pedido");
    }

    return res.json();
  },
};