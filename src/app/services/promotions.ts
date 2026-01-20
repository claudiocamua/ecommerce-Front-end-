import api from '@/lib/axios'; 

export interface PromotionTier {
  min_amount: number;
  discount_percentage: number;
}

export interface Promotion {
  _id: string;
  name: string;
  description: string;
  type: "percentage_discount" | "buy_x_pay_y" | "free_shipping" | "coupon_code" | "progressive_discount";
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  
  discount_percentage?: number;
  buy_quantity?: number;
  pay_quantity?: number;
  min_purchase_amount?: number;
  coupon_code?: string;
  coupon_discount_type?: "percentage" | "fixed";
  coupon_discount_value?: number;
  max_uses?: number;
  current_uses?: number;
  progressive_tiers?: PromotionTier[];
  product_ids?: string[];
  category_ids?: string[];
  min_order_value?: number;
  max_uses_per_user?: number;
}

export interface CreatePromotionData {
  name: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  discount_percentage?: number;
  buy_quantity?: number;
  pay_quantity?: number;
  min_purchase_amount?: number;
  coupon_code?: string;
  coupon_discount_type?: "percentage" | "fixed";
  coupon_discount_value?: number;
  max_uses?: number;
  max_uses_per_user?: number;
  min_order_value?: number;
  product_ids?: string[];
  progressive_tiers?: Array<{ min_amount: number; discount_percentage: number }>;
}

// Serviço de Promoções
export const promotionsService = {
  async getAll() {
    console.log(' [PROMOTIONS] Iniciando busca de promoções...');
    const response = await api.get('/promotions'); 
    console.log(' [PROMOTIONS] Promoções recebidas:', response.data.length);
    return response.data;
  },

  async create(data: CreatePromotionData) {
    console.log(' [PROMOTIONS] Criando promoção:', data);
    const response = await api.post('/promotions', data);
    console.log(' [PROMOTIONS] Promoção criada:', response.data);
    return response.data;
  },

  async update(id: string, data: Partial<CreatePromotionData>) {
    console.log(' [PROMOTIONS] Atualizando promoção:', id, data);
    const response = await api.put(`/promotions/${id}`, data);
    console.log(' [PROMOTIONS] Promoção atualizada:', response.data);
    return response.data;
  },

  async delete(id: string) {
    console.log(' [PROMOTIONS] Deletando promoção:', id);
    await api.delete(`/promotions/${id}`);
    console.log(' [PROMOTIONS] Promoção deletada');
  },
};