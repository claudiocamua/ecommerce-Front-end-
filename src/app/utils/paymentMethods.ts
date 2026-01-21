import {
  CreditCardIcon,
  BanknotesIcon,
  BoltIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export const PAYMENT_METHODS = {
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  pix: "PIX",
  boleto: "Boleto Bancário",
} as const;

export type PaymentMethodKey = keyof typeof PAYMENT_METHODS;

export const PAYMENT_ICONS = {
  credit_card: CreditCardIcon,
  debit_card: BanknotesIcon,
  pix: BoltIcon,
  boleto: DocumentTextIcon,
} as const;

export const getPaymentMethodLabel = (key: PaymentMethodKey): string => {
  return PAYMENT_METHODS[key];
};

export const getPaymentMethodDisplay = (
  key: PaymentMethodKey
): string => {
  return PAYMENT_METHODS[key];
};
