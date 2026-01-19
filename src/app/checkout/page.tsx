"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { ordersService } from "../services/orders";
import { toast } from "react-hot-toast";
import NavbarDashboard from "@/app/components/dashboard/NavbarDashboard";
import Footer from "@/app/components/layout/Footer";
import { authService } from "@/app/services/auth";
import MercadoPagoCheckout from "@/app/components/payment/MercadoPagoCheckout";
import {
  CreditCardIcon,
  QrCodeIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

type PaymentMethod = "mercadopago" | "pix" | "credit_card" | "debit_card" | "boleto" | "store_pickup";

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: any;
  description: string;
  color: string;
}

interface PixData {
  pix_key: string;
  qr_code: string;
  expiration_date: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart, loading: cartLoading } = useCart();
  const user = authService.getUser();

  const [formData, setFormData] = useState({
    payment_method: "mercadopago" as PaymentMethod,
    shipping_address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
    },
    card_data: {
      card_number: "",
      card_holder: "",
      expiry_date: "",
      cvv: "",
      installments: 1,
    },
  });

  const [loading, setLoading] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(true);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [loadingPix, setLoadingPix] = useState(false);
  const [pixKeyCopied, setPixKeyCopied] = useState(false);
  const [mercadoPagoPreferenceId, setMercadoPagoPreferenceId] = useState<string | null>(null);
  const [loadingMercadoPago, setLoadingMercadoPago] = useState(false);

  const paymentOptions: PaymentOption[] = [
    {
      id: "mercadopago",
      name: "Mercado Pago",
      icon: CreditCardIcon,
      description: "Pague com cartão, PIX ou saldo",
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "pix",
      name: "PIX",
      icon: QrCodeIcon,
      description: "Aprovação instantânea",
      color: "from-teal-500 to-cyan-600",
    },
    {
      id: "credit_card",
      name: "Cartão de Crédito",
      icon: CreditCardIcon,
      description: "Parcelamento em até 12x",
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "debit_card",
      name: "Cartão de Débito",
      icon: CreditCardIcon,
      description: "Débito à vista",
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "boleto",
      name: "Boleto Bancário",
      icon: DocumentTextIcon,
      description: "Vencimento em 3 dias",
      color: "from-orange-500 to-amber-600",
    },
    {
      id: "store_pickup",
      name: "Retirar na Loja",
      icon: BuildingStorefrontIcon,
      description: "Pague em dinheiro na retirada",
      color: "from-purple-500 to-pink-600",
    },
  ];

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error("Faça login para continuar");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    setShowCardForm(
      formData.payment_method === "credit_card" ||
      formData.payment_method === "debit_card"
    );
    setShowAddressForm(formData.payment_method !== "store_pickup");
    
    // Limpar dados do PIX quando mudar de método
    if (formData.payment_method !== "pix") {
      setPixData(null);
    }
    
    if (formData.payment_method !== "mercadopago") {
      setMercadoPagoPreferenceId(null);
    }
  }, [formData.payment_method]);

  // Criar preferência do Mercado Pago
  async function createMercadoPagoPreference() {
    setLoadingMercadoPago(true);
    try {
      console.log(" Criando preferência com carrinho:", cart);

      const totalAmount = getTotalPrice();
      const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      
      const requestBody = {
        title: `Compra - ${itemsCount} produto(s)`,
        quantity: 1,
        unit_price: totalAmount,
        payer_email: user?.email || "comprador@email.com"
      };

      console.log(" Enviando para backend:", requestBody);

      const response = await fetch(
        "http://localhost:8000/payment/preference/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log(" Status da resposta:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(" Erro do backend:", errorData);
        throw new Error(
          errorData.detail || "Erro ao criar preferência de pagamento"
        );
      }

      const data = await response.json();
      console.log(" Preferência criada:", data);

      setMercadoPagoPreferenceId(data.preference_id);
      toast.success(" Checkout Mercado Pago pronto!");
    } catch (error: any) {
      console.error(" Erro ao criar preferência:", error);
      toast.error(error.message || "Erro ao carregar Mercado Pago");
    } finally {
      setLoadingMercadoPago(false);
    }
  }
  // Carregar dados do PIX
  async function loadPixData() {
    setLoadingPix(true);
    try {
      const response = await fetch("http://localhost:8000/payment/pix/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          amount: getTotalPrice(),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar PIX");
      }

      const data = await response.json();
      setPixData(data);
      toast.success(" PIX gerado com sucesso!");
    } catch (error) {
      console.error(" Erro ao gerar PIX:", error);
      toast.error("Erro ao gerar PIX");
    } finally {
      setLoadingPix(false);
    }
  }

  function handlePaymentMethodChange(method: PaymentMethod) {
    setFormData((prev) => ({ ...prev, payment_method: method }));
    
    // Se selecionar PIX, carregar dados automaticamente
    if (method === "pix") {
      loadPixData();
    } else if (method === "mercadopago") {
      createMercadoPagoPreference();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (name.startsWith("address_")) {
      const addressField = name.replace("address_", "");
      setFormData((prev) => ({
        ...prev,
        shipping_address: {
          ...prev.shipping_address,
          [addressField]: value,
        },
      }));
    } else if (name.startsWith("card_")) {
      const cardField = name.replace("card_", "");
      setFormData((prev) => ({
        ...prev,
        card_data: {
          ...prev.card_data,
          [cardField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  function formatCardNumber(value: string) {
    return value
      .replace(/\s/g, "")
      .match(/.{1,4}/g)
      ?.join(" ")
      .substring(0, 19) || "";
  }

  function formatExpiryDate(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .substring(0, 5);
  }

  // Copiar chave PIX
  async function copyPixKey() {
    if (!pixData?.pix_key) return;

    try {
      await navigator.clipboard.writeText(pixData.pix_key);
      setPixKeyCopied(true);
      toast.success(" Chave PIX copiada!");
      
      setTimeout(() => setPixKeyCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar chave PIX");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Se for Mercado Pago, não precisa enviar formulário
    if (formData.payment_method === "mercadopago") {
      toast.info("Complete o pagamento no Mercado Pago");
      return;
    }

    setLoading(true);

    try {
      console.log("🛒 Finalizando pedido...");

      const orderData: any = {
        payment_method: formData.payment_method,
      };

      if (formData.payment_method !== "store_pickup") {
        orderData.shipping_address = formData.shipping_address;
      }

      if (showCardForm) {
        orderData.card_data = formData.card_data;
      }

      // Adicionar dados do PIX se necessário
      if (formData.payment_method === "pix" && pixData) {
        orderData.pix_data = {
          pix_key: pixData.pix_key,
          qr_code: pixData.qr_code,
        };
      }

      const order = await ordersService.createOrder(orderData);

      console.log(" Pedido criado:", order);

      const successMessages: Record<PaymentMethod, string> = {
        mercadopago: " Redirecionando para o Mercado Pago...",
        pix: " Pedido confirmado! Aguardando pagamento via PIX",
        credit_card: " Pedido aprovado! Pagamento processado com sucesso",
        debit_card: " Pedido aprovado! Débito confirmado",
        boleto: " Pedido confirmado! Boleto gerado com sucesso",
        store_pickup: " Pedido confirmado! Retire na loja e pague em dinheiro",
      };

      toast.success(successMessages[formData.payment_method], {
        duration: 4000,
      });

      clearCart();
      router.push("/dashboard");
    } catch (err: any) {
      console.error(" Erro ao finalizar pedido:", err);
      toast.error(err.message || "Erro ao finalizar pedido");
    } finally {
      setLoading(false);
    }
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <NavbarDashboard user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-white font-semibold text-lg">Carregando carrinho...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <NavbarDashboard user={user} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-white/20 max-w-md">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-2xl font-bold text-white mb-4">Carrinho Vazio</h1>
            <p className="text-white/80 mb-6">Adicione produtos para finalizar a compra</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl hover:bg-yellow-500 font-bold transition-all shadow-lg hover:shadow-xl"
            >
              Ir às Compras
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <NavbarDashboard user={user} />

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-8">
             Finalizar Compra
          </h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda - Métodos de Pagamento */}
            <div className="lg:col-span-2 space-y-6">
              {/* Escolha do Método de Pagamento */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6"> Escolha o Método de Pagamento</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = formData.payment_method === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handlePaymentMethodChange(option.id)}
                        className={`
                          relative p-4 rounded-xl border-2 transition-all
                          ${
                            isSelected
                              ? `border-yellow-400 bg-gradient-to-br ${option.color} shadow-lg scale-105`
                              : "border-white/20 bg-white/5 hover:border-white/40"
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-white/10'}`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-bold text-white">{option.name}</h3>
                            <p className="text-sm text-white/80">{option.description}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                <span className="text-black text-sm">✓</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ✅ Checkout Mercado Pago */}
              {formData.payment_method === "mercadopago" && (
                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-2 border-blue-400 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <CreditCardIcon className="w-6 h-6" />
                    Pagar com Mercado Pago
                  </h2>

                  {loadingMercadoPago ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-400 mx-auto mb-4"></div>
                      <p className="text-white/90">Preparando checkout...</p>
                    </div>
                  ) : mercadoPagoPreferenceId ? (
                    <MercadoPagoCheckout
                      preferenceId={mercadoPagoPreferenceId}
                      onReady={() => console.log("Mercado Pago pronto")}
                      onError={(error) => console.error("Erro Mercado Pago:", error)}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/80 mb-4">Erro ao carregar checkout</p>
                      <button
                        type="button"
                        onClick={createMercadoPagoPreference}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
                      >
                        Tentar Novamente
                      </button>
                    </div>
                  )}

                  <div className="mt-6 bg-white/10 rounded-lg p-4">
                    <p className="text-sm text-white/90">
                      ℹ Você será redirecionado para o ambiente seguro do Mercado Pago para finalizar o pagamento.
                    </p>
                  </div>
                </div>
              )}

              {/* Dados do PIX */}
              {formData.payment_method === "pix" && (
                <div className="bg-gradient-to-br from-teal-500/20 to-cyan-600/20 border-2 border-teal-400 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <QrCodeIcon className="w-6 h-6" />
                    Pagamento via PIX
                  </h2>

                  {loadingPix ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-400 mx-auto mb-4"></div>
                      <p className="text-white/90">Gerando código PIX...</p>
                    </div>
                  ) : pixData ? (
                    <div className="space-y-6">
                      {/* QR Code */}
                      <div className="bg-white rounded-2xl p-6 flex justify-center">
                        <img
                          src={pixData.qr_code}
                          alt="QR Code PIX"
                          className="w-64 h-64 object-contain"
                        />
                      </div>

                      {/* Chave PIX */}
                      <div>
                        <label className="block mb-2 text-white/90 font-semibold">
                          Chave PIX (Copie e cole no seu banco)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pixData.pix_key}
                            readOnly
                            className="flex-1 bg-white/10 border border-white/20 text-white p-3 rounded-lg font-mono text-sm"
                          />
                          <button
                            type="button"
                            onClick={copyPixKey}
                            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                              pixKeyCopied
                                ? "bg-green-500 text-white"
                                : "bg-teal-500 hover:bg-teal-600 text-white"
                            }`}
                          >
                            {pixKeyCopied ? (
                              <CheckCircleIcon className="w-6 h-6" />
                            ) : (
                              <ClipboardDocumentIcon className="w-6 h-6" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Instruções */}
                      <div className="bg-white/10 rounded-lg p-4 space-y-2">
                        <h3 className="font-bold text-white mb-2"> Como pagar:</h3>
                        <ol className="text-sm text-white/90 space-y-1 list-decimal list-inside">
                          <li>Abra o app do seu banco</li>
                          <li>Escolha a opção Pix e "Pix Copia e Cola"</li>
                          <li>Cole a chave PIX copiada ou escaneie o QR Code</li>
                          <li>Confirme o pagamento de <strong>R$ {getTotalPrice().toFixed(2)}</strong></li>
                          <li>Pronto! Seu pedido será confirmado automaticamente</li>
                        </ol>
                      </div>

                      {/* Validade */}
                      {pixData.expiration_date && (
                        <div className="text-center text-sm text-white/80">
                           Este código expira em: <strong>{new Date(pixData.expiration_date).toLocaleString('pt-BR')}</strong>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/80 mb-4">Erro ao gerar código PIX</p>
                      <button
                        type="button"
                        onClick={loadPixData}
                        className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold"
                      >
                        Tentar Novamente
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Formulário de Cartão (se necessário) */}
              {showCardForm && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                  <h2 className="text-xl font-bold text-white mb-6"> Dados do Cartão</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-white/90 font-semibold">Número do Cartão *</label>
                      <input
                        name="card_card_number"
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-white/5 border border-white/20 text-white placeholder-white/50 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent font-mono"
                        onChange={(e) => {
                          e.target.value = formatCardNumber(e.target.value);
                          handleChange(e);
                        }}
                        value={formData.card_data.card_number}
                        maxLength={19}
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-white/90 font-semibold">Nome no Cartão *</label>
                      <input
                        name="card_card_holder"
                        placeholder="NOME COMPLETO"
                        className="w-full bg-white/5 border border-white/20 text-white placeholder-white/50 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent uppercase"
                        onChange={handleChange}
                        value={formData.card_data.card_holder}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-white/90 font-semibold">Validade *</label>
                        <input
                          name="card_expiry_date"
                          placeholder="MM/AA"
                          className="w-full bg-white/5 border border-white/20 text-white placeholder-white/50 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent font-mono"
                          onChange={(e) => {
                            e.target.value = formatExpiryDate(e.target.value);
                            handleChange(e);
                          }}
                          value={formData.card_data.expiry_date}
                          maxLength={5}
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-white/90 font-semibold">CVV *</label>
                        <input
                          name="card_cvv"
                          type="password"
                          placeholder="000"
                          className="w-full bg-white/5 border border-white/20 text-white placeholder-white/50 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent font-mono"
                          onChange={handleChange}
                          value={formData.card_data.cvv}
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>

                    {formData.payment_method === "credit_card" && (
                      <div>
                        <label className="block mb-2 text-white/90 font-semibold">Parcelamento</label>
                        <select
                          name="card_installments"
                          className="w-full bg-white/5 border border-white/20 text-white p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          onChange={handleChange}
                          value={formData.card_data.installments}
                        >
                          {[...Array(12)].map((_, i) => {
                            const installment = i + 1;
                            const installmentValue = getTotalPrice() / installment;
                            return (
                              <option key={installment} value={installment} className="bg-gray-800">
                                {installment}x de R$ {installmentValue.toFixed(2)}
                                {installment === 1 ? " (à vista)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Formulário de Endereço (se necessário) */}
              {showAddressForm && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                  <h2 className="text-xl font-bold text-white mb-6"> Endereço de Entrega</h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-white/90 font-semibold">CEP *</label>
                        <input
                          name="address_zip_code"
                          placeholder="00000-000"
                          className="w-full bg-white/5 border border-white/20 text-white placeholder-white/50 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          onChange={handleChange}
                          value={formData.shipping_address.zip_code}
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-white/90 font-semibold">Estado *</label>
                        <input
                          name="address_state"
                          placeholder="UF"
                          maxLength={2}
                          className="w-full bg-white/5 border border-white/20 text-white placeholder-white/50 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent uppercase"
                          onChange={handleChange}
                          value={formData.shipping_address.state}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-white/90 font-semibold">Cidade *</label>
                      <input
                        name="address_city"
                        placeholder="Cidade"
                        className="w-full bg-white/5 border border-white/20 text-white placeholder-white/50 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        onChange={handleChange}
                        value={formData.shipping_address.city}
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-white/90 font-semibold">Bairro *</label>
                      <input
                        name="address_neighborhood"
                        placeholder="Bairro"
                        className="w-full bg-white/5 border border-white/20 text-white placeholder-white/50 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        onChange={handleChange}
                        value={formData.shipping_address.neighborhood}
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-white/90 font-semibold">Rua *</label>
                      <input
                        name="address_street"
                        placeholder="Rua, Avenida..."
                        className="w-full bg-white/5 border border-white/20 text-white placeholder-white/50 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        onChange={handleChange}
                        value={formData.shipping_address.street}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-white/90 font-semibold">Número *</label>
                        <input
                          name="address_number"
                          placeholder="123"
                          className="w-full bg-white/5 border border-white/20 text-white placeholder-white/50 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          onChange={handleChange}
                          value={formData.shipping_address.number}
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-white/90 font-semibold">Complemento</label>
                        <input
                          name="address_complement"
                          placeholder="Apto, Bloco..."
                          className="w-full bg-white/5 border border-white/20 text-white placeholder-white/50 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          onChange={handleChange}
                          value={formData.shipping_address.complement}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aviso de Retirada na Loja */}
              {formData.payment_method === "store_pickup" && (
                <div className="bg-purple-500/20 border-2 border-purple-400 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <BuildingStorefrontIcon className="w-8 h-8 text-purple-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-white mb-2"> Retirada na Loja</h3>
                      <p className="text-white/90 mb-2">
                        Você escolheu retirar o produto na loja e pagar em dinheiro.
                      </p>
                      <p className="text-sm text-white/80">
                         <strong>Endereço:</strong> Rua Exemplo, 123 - Centro<br />
                         <strong>Horário:</strong> Seg-Sex: 9h-18h | Sáb: 9h-13h
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Coluna Direita - Resumo do Pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6"> Resumo do Pedido</h2>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm bg-white/5 p-3 rounded-lg border border-white/10">
                      <span className="text-white/90">
                        {item.name} <span className="font-bold text-yellow-400">x{item.quantity}</span>
                      </span>
                      <span className="font-bold text-white">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/20 pt-4 space-y-3">
                  <div className="flex justify-between text-white/80">
                    <span>Subtotal:</span>
                    <span>R$ {getTotalPrice().toFixed(2)}</span>
                  </div>

                  {formData.payment_method !== "store_pickup" && (
                    <div className="flex justify-between text-white/80">
                      <span>Frete:</span>
                      <span className="text-green-400 font-semibold">GRÁTIS</span>
                    </div>
                  )}

                  <div className="border-t border-white/20 pt-3 flex justify-between text-lg font-bold">
                    <span className="text-white">Total:</span>
                    <span className="text-green-400 text-2xl">R$ {getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || (formData.payment_method === "pix" && !pixData)}
                  className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 font-bold transition-all shadow-lg hover:shadow-xl text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processando...
                    </span>
                  ) : (
                    ` Finalizar Pedido`
                  )}
                </button>

                <p className="text-xs text-white/60 text-center mt-4">
                   Pagamento 100% seguro e protegido
                </p>
              </div>
            </div>
          </form>
        </main>
      </div>

      <Footer />
    </div>
  );
}