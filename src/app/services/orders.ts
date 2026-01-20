import api from '@/lib/axios';

export interface Order {
  _id?: string;
  id: string;
  user_id: string;
  items: Array<{
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    subtotal: number;
    image_url?: string;
  }>;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  created_at: string;
  updated_at: string;
  total_amount?: number;
}

const normalizeOrder = (order: any): Order => {
  const id = order._id || order.id;
  
  if (!id) {
    console.error(' Pedido sem ID:', order);
  }
  
  return {
    ...order,
    id: id,
    _id: id,
  };
};

export const ordersService = {
  async getAllOrders(): Promise<Order[]> {
    console.log(' [ORDERS] Buscando todos os pedidos...');
    const response = await api.get('/orders/admin/all');
    console.log(' [ORDERS] Pedidos recebidos:', response.data.length);
    return response.data;
  },

  async getOrder(orderId: string): Promise<Order> {
    try {
      console.log(' Buscando pedido:', orderId);
      const response = await api.get(`/orders/${orderId}`);
      return normalizeOrder(response.data);
    } catch (error: any) {
      console.error(' Erro ao buscar pedido:', error);
      throw error;
    }
  },

  async createOrder(orderData: any): Promise<Order> {
    try {
      console.log(' Criando pedido:', orderData);
      const response = await api.post('/orders', orderData);
      return normalizeOrder(response.data);
    } catch (error: any) {
      console.error(' Erro ao criar pedido:', error);
      throw error;
    }
  },

  async updateOrder(orderId: string, updateData: any): Promise<Order> {
    try {
      console.log(' Atualizando pedido:', orderId, updateData);
      
      if (!orderId || orderId === 'undefined') {
        throw new Error('ID do pedido é inválido: ' + orderId);
      }
      
      const response = await api.put(`/orders/admin/${orderId}`, updateData);
      return normalizeOrder(response.data);
    } catch (error: any) {
      console.error(' Erro ao atualizar pedido:', error);
      throw error;
    }
  },

  async confirmPayment(orderId: string): Promise<any> {
    try {
      console.log(' Confirmando pagamento para pedido:', orderId);
      
      if (!orderId || orderId === 'undefined') {
        throw new Error('ID do pedido é inválido: ' + orderId);
      }
      
      const response = await api.post(`/orders/admin/${orderId}/confirm-payment`);
      console.log(' Pagamento confirmado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(' Erro ao confirmar pagamento:', error);
      throw error;
    }
  },

  async markAsShipped(orderId: string, trackingCode?: string): Promise<any> {
    try {
      console.log(' Marcando como enviado:', orderId, trackingCode);
      
      if (!orderId || orderId === 'undefined') {
        throw new Error('ID do pedido é inválido: ' + orderId);
      }
      
      const params = trackingCode ? { tracking_code: trackingCode } : {};
      const response = await api.post(`/orders/admin/${orderId}/mark-shipped`, null, { params });
      return response.data;
    } catch (error: any) {
      console.error(' Erro ao marcar como enviado:', error);
      throw error;
    }
  },

  async markAsDelivered(orderId: string): Promise<any> {
    try {
      console.log(' Marcando como entregue:', orderId);
      
      if (!orderId || orderId === 'undefined') {
        throw new Error('ID do pedido é inválido: ' + orderId);
      }
      
      const response = await api.put(`/orders/${orderId}/status`, { status: 'delivered' });
      return response.data;
    } catch (error: any) {
      console.error(' Erro ao marcar como entregue:', error);
      throw error;
    }
  }, 

  async adminCancelOrder(orderId: string, reason?: string): Promise<any> {
    try {
      console.log(' Cancelando pedido:', orderId, reason);
      
      if (!orderId || orderId === 'undefined') {
        throw new Error('ID do pedido é inválido: ' + orderId);
      }
      
      const params = reason ? { reason } : {};
      const response = await api.post(`/orders/admin/${orderId}/cancel`, null, { params });
      return response.data;
    } catch (error: any) {
      console.error(' Erro ao cancelar pedido:', error);
      throw error;
    }
  }, 

  async getUserOrders(): Promise<Order[]> {
    try {
      console.log(' Buscando pedidos do usuário...');
      const response = await api.get('/orders');
      return response.data.map(normalizeOrder);
    } catch (error: any) {
      console.error(' Erro ao buscar pedidos do usuário:', error);
      throw error;
    }
  }
};