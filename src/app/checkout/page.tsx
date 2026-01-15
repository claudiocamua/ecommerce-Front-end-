"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { ordersService } from "../services/orders";
import { toast } from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart } = useCart();

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
      const orderData = {
        user_id: "current_user", // Será preenchido pelo backend
        items: cart.map((item) => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: getTotalPrice(),
        status: "pending" as const,
        payment_method: formData.payment_method,
        shipping_address: formData.shipping_address,
      };

      const order = await ordersService.createOrder(orderData);

      toast.success("Pedido realizado com sucesso!");
      clearCart();
      router.push(`/orders/${order._id || order.id}`);
    } catch (err: any) {
      console.error("Erro ao finalizar pedido:", err);
      toast.error(err.message || "Erro ao finalizar pedido");
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-4">Carrinho Vazio</h1>
          <p className="text-gray-400 mb-6">Adicione produtos para finalizar a compra</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Ir às Compras
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Dados de Entrega</h2>

            <div>
              <label className="block mb-2">CEP *</label>
              <input
                name="address_zip_code"
                placeholder="00000-000"
                className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
                onChange={handleChange}
                value={formData.shipping_address.zip_code}
                required
              />
            </div>

            <div>
              <label className="block mb-2">Rua *</label>
              <input
                name="address_street"
                placeholder="Rua, Avenida..."
                className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
                onChange={handleChange}
                value={formData.shipping_address.street}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Número *</label>
                <input
                  name="address_number"
                  placeholder="123"
                  className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
                  onChange={handleChange}
                  value={formData.shipping_address.number}
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Complemento</label>
                <input
                  name="address_complement"
                  placeholder="Apto, Bloco..."
                  className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
                  onChange={handleChange}
                  value={formData.shipping_address.complement}
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">Bairro *</label>
              <input
                name="address_neighborhood"
                placeholder="Bairro"
                className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
                onChange={handleChange}
                value={formData.shipping_address.neighborhood}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Cidade *</label>
                <input
                  name="address_city"
                  placeholder="Cidade"
                  className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
                  onChange={handleChange}
                  value={formData.shipping_address.city}
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Estado *</label>
                <input
                  name="address_state"
                  placeholder="UF"
                  maxLength={2}
                  className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
                  onChange={handleChange}
                  value={formData.shipping_address.state}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">Forma de Pagamento *</label>
              <select
                name="payment_method"
                className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
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
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold"
            >
              {loading ? "Processando..." : "Finalizar Pedido"}
            </button>
          </form>

          {/* Resumo */}
          <div className="bg-gray-800 rounded-lg p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>

            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-400">R$ {getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}