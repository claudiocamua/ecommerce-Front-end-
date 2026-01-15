"use client";

import { useState } from "react";
import { PaymentMethodKey, PAYMENT_METHODS, PAYMENT_ICONS } from "@/app/utils/paymentMethods";
import { toast } from "react-hot-toast";
import {
  CreditCardIcon,
  QrCodeIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

interface PaymentFormProps {
  paymentMethod: PaymentMethodKey;
  totalAmount: number;
  onPaymentComplete: () => void;
}

export default function PaymentForm({ paymentMethod, totalAmount, onPaymentComplete }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);

  // Estados para Cartão de Crédito/Débito
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [installments, setInstallments] = useState("1");

  // Estado para PIX
  const [pixCode, setPixCode] = useState("");
  const [pixQrCode, setPixQrCode] = useState("");

  // Estado para Boleto
  const [boletoCode, setBoletoCode] = useState("");

  // Gerar PIX (simulado)
  const generatePix = () => {
    setLoading(true);
    setTimeout(() => {
      const fakePixCode = `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substr(2, 9)}520400005303986540${totalAmount.toFixed(2)}5802BR5925MINHALOJA6009SAO PAULO62070503***6304${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      setPixCode(fakePixCode);
      setPixQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fakePixCode)}`);
      setLoading(false);
      toast.success("QR Code PIX gerado com sucesso!");
    }, 1500);
  };

  // Gerar Boleto (simulado)
  const generateBoleto = () => {
    setLoading(true);
    setTimeout(() => {
      const fakeBoletoCode = `23793.${Math.floor(Math.random() * 90000) + 10000} ${Math.floor(Math.random() * 90000) + 10000}.${Math.floor(Math.random() * 900000) + 100000} ${Math.floor(Math.random() * 90000) + 10000}.${Math.floor(Math.random() * 900000) + 100000} ${Math.floor(Math.random() * 9) + 1} ${Math.floor(Math.random() * 9000000000000) + 1000000000000}`;
      setBoletoCode(fakeBoletoCode);
      setLoading(false);
      toast.success("Boleto gerado com sucesso!");
    }, 1500);
  };

  // Processar pagamento com cartão
  const processCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      toast.error("Preencha todos os campos do cartão");
      return;
    }

    setLoading(true);
    
    // Simular processamento
    setTimeout(() => {
      setLoading(false);
      toast.success("Pagamento aprovado!");
      onPaymentComplete();
    }, 2000);
  };

  // Copiar código PIX
  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    toast.success("Código PIX copiado!");
  };

  // Copiar código de barras do boleto
  const copyBoletoCode = () => {
    navigator.clipboard.writeText(boletoCode.replace(/\s/g, ""));
    toast.success("Código de barras copiado!");
  };

  // Formatar número do cartão
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19);
  };

  // Formatar data de validade
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  // Renderizar formulário baseado no método
  const renderPaymentContent = () => {
    switch (paymentMethod) {
      case "credit_card":
      case "debit_card":
        return (
          <form onSubmit={processCardPayment} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Número do Cartão
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full text-black px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
                <CreditCardIcon className="absolute right-3 top-3 w-6 h-6 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Nome no Cartão
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                placeholder="NOME COMPLETO"
                className="w-full text-black px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Validade
                </label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/AA"
                  maxLength={5}
                  className="w-full text-black px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                  placeholder="000"
                  maxLength={4}
                  className="w-full text-black px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {paymentMethod === "credit_card" && (
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Parcelas
                </label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  className="w-full text-black px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="1">1x de R$ {totalAmount.toFixed(2)} sem juros</option>
                  <option value="2">2x de R$ {(totalAmount / 2).toFixed(2)} sem juros</option>
                  <option value="3">3x de R$ {(totalAmount / 3).toFixed(2)} sem juros</option>
                  <option value="4">4x de R$ {(totalAmount / 4).toFixed(2)} sem juros</option>
                  <option value="5">5x de R$ {(totalAmount / 5).toFixed(2)} sem juros</option>
                  <option value="6">6x de R$ {(totalAmount / 6).toFixed(2)} sem juros</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold text-lg shadow-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <CreditCardIcon className="w-6 h-6" />
                  <span>Pagar R$ {totalAmount.toFixed(2)}</span>
                </>
              )}
            </button>
          </form>
        );

      case "pix":
        return (
          <div className="space-y-4">
            {!pixCode ? (
              <button
                onClick={generatePix}
                disabled={loading}
                className="w-full py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-bold text-lg shadow-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Gerando QR Code...</span>
                  </>
                ) : (
                  <>
                    <QrCodeIcon className="w-6 h-6" />
                    <span>Gerar QR Code PIX</span>
                  </>
                )}
              </button>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-white p-4 rounded-lg inline-block border-2 border-purple-300">
                  <img src={pixQrCode} alt="QR Code PIX" className="w-64 h-64 mx-auto" />
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Código PIX Copia e Cola:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pixCode}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border rounded text-xs font-mono"
                    />
                    <button
                      onClick={copyPixCode}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition flex items-center gap-2"
                    >
                      <ClipboardDocumentIcon className="w-5 h-5" />
                      Copiar
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-sm text-yellow-800">
                    ⏱️ O QR Code expira em <strong>30 minutos</strong>. Após o pagamento, seu pedido será confirmado automaticamente.
                  </p>
                </div>

                <button
                  onClick={onPaymentComplete}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
                >
                  ✅ Já fiz o pagamento
                </button>
              </div>
            )}
          </div>
        );

      case "boleto":
        return (
          <div className="space-y-4">
            {!boletoCode ? (
              <button
                onClick={generateBoleto}
                disabled={loading}
                className="w-full py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-bold text-lg shadow-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Gerando Boleto...</span>
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="w-6 h-6" />
                    <span>Gerar Boleto Bancário</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-white border-2 border-orange-300 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <DocumentTextIcon className="w-16 h-16 text-orange-600 mx-auto mb-2" />
                    <h3 className="font-bold text-xl text-gray-900">Boleto Gerado</h3>
                    <p className="text-3xl font-bold text-orange-600 mt-2">
                      R$ {totalAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Código de Barras:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={boletoCode}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border rounded text-sm font-mono"
                      />
                      <button
                        onClick={copyBoletoCode}
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition flex items-center gap-2"
                      >
                        <ClipboardDocumentIcon className="w-5 h-5" />
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-sm text-red-800">
                    ⚠️ Vencimento: <strong>3 dias úteis</strong>. O pedido será confirmado após a compensação bancária (até 2 dias úteis).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => window.print()}
                    className="py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition"
                  >
                    🖨️ Imprimir Boleto
                  </button>
                  <button
                    onClick={onPaymentComplete}
                    className="py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
                  >
                    ✅ Concluir
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b">
        <span className="text-3xl">{PAYMENT_ICONS[paymentMethod]}</span>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {PAYMENT_METHODS[paymentMethod]}
          </h2>
          <p className="text-sm text-gray-600">
            Total a pagar: <span className="font-bold text-blue-600">R$ {totalAmount.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {renderPaymentContent()}
    </div>
  );
}