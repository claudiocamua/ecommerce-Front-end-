export const PAYMENT_METHODS = {
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  pix: "PIX",
  boleto: "Boleto Bancário",
} as const;
// Tipo que representa as chaves dos métodos de pagamento
export type PaymentMethodKey = keyof typeof PAYMENT_METHODS;
export const PAYMENT_ICONS = {
  credit_card: "💳",
  debit_card: "🏧",
  pix: "⚡",
  boleto: "🧾",
} as const;
export const getPaymentMethodLabel = (key: PaymentMethodKey): string => {
  return PAYMENT_METHODS[key];
};
export const getPaymentMethodDisplay = (key: PaymentMethodKey): string => {
  return `${PAYMENT_ICONS[key]} ${PAYMENT_METHODS[key]}`;
};