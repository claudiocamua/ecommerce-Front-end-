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
) => {
  const Icon = PAYMENT_ICONS[key];

  return (
    <span className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-yellow-500" />
      {PAYMENT_METHODS[key]}
    </span>
  );
};
