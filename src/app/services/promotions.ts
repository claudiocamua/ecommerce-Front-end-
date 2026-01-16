import api from "./api";

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
  progressive_tiers?: PromotionTier[];
  product_ids?: string[];
  category_ids?: string[];
  min_order_value?: number;
  max_uses_per_user?: number;
}

export const promotionsService = {
  // GET /admin/promotions/
  async getAll(): Promise<Promotion[]> {
    console.log("📤 Buscando promoções...");
    const response = await api.get("/admin/promotions/");
    console.log("📥 Promoções recebidas:", response.data);
    return response.data;
  },

  // POST /admin/promotions/
  async create(data: CreatePromotionData): Promise<Promotion> {
    console.log("📤 Criando promoção:", data);
    const response = await api.post("/admin/promotions/", data);
    console.log("📥 Promoção criada:", response.data);
    return response.data;
  },

  // PUT /admin/promotions/{id}
  async update(id: string, data: Partial<CreatePromotionData>): Promise<Promotion> {
    console.log(`📤 Atualizando promoção ${id}:`, data);
    const response = await api.put(`/admin/promotions/${id}`, data);
    console.log("📥 Promoção atualizada:", response.data);
    return response.data;
  },

  // DELETE /admin/promotions/{id}
  async delete(id: string): Promise<void> {
    console.log(`📤 Deletando promoção ${id}`);
    await api.delete(`/admin/promotions/${id}`);
    console.log("✅ Promoção deletada");
  },

  // POST /cart/apply-promotion (se implementado no backend)
  async applyToCart(couponCode?: string) {
    const response = await api.post("/cart/apply-promotion", {
      coupon_code: couponCode
    });
    return response.data;
  }
};