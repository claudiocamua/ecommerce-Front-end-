import api from "./api";

export interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_name: string;
  user_email: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_method: string;
  shipping_address: ShippingAddress;
  status: string;
  created_at: string;
  updated_at: string;
  estimated_delivery: string;
  tracking_code: string | null;
}

export interface OrdersResponse {
  total: number;
  page: number;
  page_size: number;
  orders: Order[];
}

export interface OrderStats {
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  orders_by_status: Record<string, number>;
}

export const ordersService = {
  // Criar pedido (checkout)
  async createOrder(data: {
    shipping_address: ShippingAddress;
    payment_method: string;
  }): Promise<Order> {
    const response = await api.post("/orders/", data);
    return response.data;
  },

  // Listar meus pedidos
  async getMyOrders(params?: {
    page?: number;
    page_size?: number;
  }): Promise<OrdersResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());

    const response = await api.get(`/orders/my-orders?${queryParams.toString()}`);
    return response.data;
  },

  // Ver detalhes do pedido
  async getOrderById(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Cancelar pedido
  async cancelOrder(id: string): Promise<{ message: string; order: Order }> {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  },

  // Estatísticas de pedidos
  async getOrderStats(): Promise<OrderStats> {
    const response = await api.get("/orders/stats/summary");
    return response.data;
  },
};