"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { ordersService } from "../services/orders";
import { toast } from "react-hot-toast";
import NavbarDashboard from "@/app/components/dashboard/NavbarDashboard";
import Footer from "@/app/components/layout/Footer";
import { authService } from "@/app/services/auth";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart, loading: cartLoading } = useCart();
  const user = authService.getUser();

  const [formData, setFormData] = useState({
    payment_method: "pix" as "credit_card" | "debit_card" | "pix" | "boleto",
    shipping_address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
    },
  });

  const [loading, setLoading] = useState(false);

  // ✅ VERIFICAR AUTENTICAÇÃO
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error("Faça login para continuar");
      router.push("/login");
    }
  }, []);

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
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🛍️ Finalizando pedido...");
      console.log("📦 Carrinho:", cart);
      console.log("📋 Dados do pedido:", formData);

      const orderData = {
        payment_method: formData.payment_method,
        shipping_address: formData.shipping_address,
      };

      const order = await ordersService.createOrder(orderData);
      
      console.log("✅ Pedido criado:", order);

      toast.success("Pedido realizado com sucesso!", {
        icon: "🎉",
        duration: 3000,
      });

      clearCart();
      
      // ✅ REDIRECIONAR PARA DASHBOARD
      router.push("/dashboard");
    } catch (err: any) {
      console.error("❌ Erro ao finalizar pedido:", err);
      toast.error(err.message || "Erro ao finalizar pedido");
    } finally {
      setLoading(false);
    }
  }

  // ✅ LOADING STATE
  if (cartLoading) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/image-fundo-4.jpg')" }}
        />
        <div className="fixed inset-0 -z-10 bg-black/50" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <NavbarDashboard user={user} />

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-white font-semibold text-lg">Carregando carrinho...</p>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    );
  }

  // ✅ CARRINHO VAZIO
  if (cart.length === 0) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/image-fundo-4.jpg')" }}
        />
        <div className="fixed inset-0 -z-10 bg-black/50" />

        <div className="relative z-10 flex flex-col min-h-screen">
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
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image-fundo-4.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/50" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavbarDashboard user={user} />

        <div className="flex-1 overflow-y-auto">
          <main className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-8">
              Finalizar Compra
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário */}
              <form onSubmit={handleSubmit} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 space-y-6 shadow-xl">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Dados de Entrega</h2>

                <div>
                  <label className="block mb-2 text-gray-700 font-semibold">CEP *</label>
                  <input
                    name="address_zip_code"
                    placeholder="00000-000"
                    className="w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    onChange={handleChange}
                    value={formData.shipping_address.zip_code}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 font-semibold">Rua *</label>
                  <input
                    name="address_street"
                    placeholder="Rua, Avenida..."
                    className="w-full bg-white/50 border border-gray-300 text-gray-900 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    onChange={handleChange}
                    value={formData.shipping_address.street}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-gray-700 font-semibold">Número *</label>
                    <input
                      name="address_number"
                      placeholder="123"
                      className="w-full bg-white/50 border border-gray-300 text-gray-900 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      onChange={handleChange}
                      value={formData.shipping_address.number}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-gray-700 font-semibold">Complemento</label>
                    <input
                      name="address_complement"
                      placeholder="Apto, Bloco..."
                      className="w-full bg-white/50 border border-gray-300 text-gray-900 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      onChange={handleChange}
                      value={formData.shipping_address.complement}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 font-semibold">Bairro *</label>
                  <input
                    name="address_neighborhood"
                    placeholder="Bairro"
                    className="w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    onChange={handleChange}
                    value={formData.shipping_address.neighborhood}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-gray-700 font-semibold">Cidade *</label>
                    <input
                      name="address_city"
                      placeholder="Cidade"
                      className="w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      onChange={handleChange}
                      value={formData.shipping_address.city}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-gray-700 font-semibold">Estado *</label>
                    <input
                      name="address_state"
                      placeholder="UF"
                      maxLength={2}
                      className="w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent uppercase"
                      onChange={handleChange}
                      value={formData.shipping_address.state}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 font-semibold">💳 Forma de Pagamento *</label>
                  <select
                    name="payment_method"
                    className="w-full bg-white/50 border border-gray-300 text-gray-900 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    onChange={handleChange}
                    value={formData.payment_method}
                    required
                  >
                    <option value="pix">PIX</option>
                    <option value="boleto">Boleto</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="debit_card">Cartão de Débito</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white/50 from-green-500 to-green-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 font-bold transition-all shadow-lg hover:shadow-xl text-lg"
                >
                  {loading ? "Processando..." : " Finalizar Pedido"}
                </button>
              </form>

              {/* Resumo */}
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 h-fit shadow-xl">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Resumo do Pedido</h2>

                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-700">
                        {item.name} <span className="font-bold">x{item.quantity}</span>
                      </span>
                      <span className="font-bold text-gray-900">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-700">Total:</span>
                    <span className="text-green-600 text-2xl">R$ {getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </div>
  );
}