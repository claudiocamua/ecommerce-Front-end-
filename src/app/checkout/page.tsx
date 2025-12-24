"use client";

import { useState, useEffect } from "react";
import { cartService, Cart } from "@/services/cart";
import { ordersService, ShippingAddress } from "@/services/orders";
import { authService } from "@/services/auth";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PAYMENT_METHODS = [
  "Cartão de Crédito",
  "Cartão de Débito",
  "PIX",
  "Boleto Bancário",
];

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "SP",
    zip_code: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Cartão de Crédito");

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error("Faça login para finalizar a compra");
      router.push("/login");
      return;
    }
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await cartService.getCart();
      if (!data.items || data.items.length === 0) {
        toast.error("Seu carrinho está vazio");
        router.push("/cart");
        return;
      }
      setCart(data);
    } catch (error: any) {
      toast.error("Erro ao carregar carrinho");
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const formatZipCode = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleZipCodeChange = (value: string) => {
    const formatted = formatZipCode(value);
    handleAddressChange("zip_code", formatted);
  };

  const validateForm = (): boolean => {
    if (!shippingAddress.street) {
      toast.error("Informe o nome da rua");
      return false;
    }
    if (!shippingAddress.number) {
      toast.error("Informe o número");
      return false;
    }
    if (!shippingAddress.neighborhood) {
      toast.error("Informe o bairro");
      return false;
    }
    if (!shippingAddress.city) {
      toast.error("Informe a cidade");
      return false;
    }
    if (!shippingAddress.zip_code || shippingAddress.zip_code.length < 9) {
      toast.error("Informe um CEP válido");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const order = await ordersService.createOrder({
        shipping_address: {
          ...shippingAddress,
          complement: shippingAddress.complement || undefined,
        },
        payment_method: paymentMethod,
      });

      toast.success("Pedido realizado com sucesso!");
      router.push(`/orders/${order.id}`);
    } catch (error: any) {
      console.error("Erro ao criar pedido:", error);
      toast.error(error.detail || "Erro ao finalizar compra");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cart) return null;

  const shippingFee = 15.0;
  const total = cart.subtotal + shippingFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
          <div className="lg:col-span-2 space-y-6">
          
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Endereço de Entrega</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.zip_code}
                    onChange={(e) => handleZipCodeChange(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rua *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) => handleAddressChange("street", e.target.value)}
                    placeholder="Nome da rua"
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.number}
                    onChange={(e) => handleAddressChange("number", e.target.value)}
                    placeholder="123"
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.complement}
                    onChange={(e) => handleAddressChange("complement", e.target.value)}
                    placeholder="Apto, Bloco, etc."
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.neighborhood}
                    onChange={(e) => handleAddressChange("neighborhood", e.target.value)}
                    placeholder="Nome do bairro"
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    placeholder="Nome da cidade"
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    value={shippingAddress.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    {BRAZILIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Método de Pagamento</h2>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>

              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.quantity}x {item.product_name}
                    </span>
                    <span className="font-semibold">
                      R$ {item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    R$ {cart.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className="font-semibold">R$ {shippingFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      R$ {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold mb-3"
              >
                {submitting ? "Processando..." : "Finalizar Pedido"}
              </button>

              <Link
                href="/cart"
                className="block w-full py-3 border border-gray-300 text-center rounded-lg hover:bg-gray-50"
              >
                Voltar ao Carrinho
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}