import api from "./api";

interface PaymentData {
  order_id: string;
  payment_method: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "BOLETO";
  amount: number;
}

interface PaymentResponse {
  payment_id: string;
  status: string;
  qr_code?: string; // Para PIX
  barcode?: string; // Para Boleto
  transaction_id?: string;
}

export const paymentsService = {
  async processPayment(data: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await api.post("/payments/process", data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data;
    }
  },

  async getPaymentStatus(payment_id: string) {
    try {
      const response = await api.get(`/payments/${payment_id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data;
    }
  },

  // POST /payments/pix/generate
  async generatePix(order_id: string, amount: number) {
    try {
      const response = await api.post("/payments/pix/generate", {
        order_id,
        amount,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data;
    }
  },

  // POST /payments/boleto/generate
  async generateBoleto(order_id: string, amount: number) {
    try {
      const response = await api.post("/payments/boleto/generate", {
        order_id,
        amount,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data;
    }
  },
};