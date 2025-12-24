// src/app/orders/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ordersService, Order } from "@/services/orders";
import { authService } from "@/services/auth";
import { toast } from "react-hot-toast";
import Link from "next/link";

const ORDER_STATUS_COLORS: Record<string, string> = {
  "Pendente": "bg-yellow-100 text-yellow-800",
  "Confirmado": "bg-blue-100 text-blue-800",
  "Enviado": "bg-purple-100 text-purple-800",
  "Entregue": "bg-green-100 text-green-800",
  "Cancelado": "bg-red-100 text-red-800",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error("Faça login para ver o pedido");
      router.push("/login");
      return;
    }
    if (params.id) {
      loadOrder();
    }
  }, [params.id]);

  const loadOrder = async () => {
    try {
      const data = await ordersService.getOrderById(params.id as string);
      setOrder(data);
    } catch (error: any) {
      toast.error("Pedido não encontrado");
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Deseja realmente cancelar este pedido?")) return;

    setCanceling(true);
    try {
      const result = await ordersService.cancelOrder(order!.id);
      setOrder(result.order);
      toast.success("Pedido cancelado com sucesso");
    } catch (error: any) {
      toast.error(error.detail || "Erro ao cancelar pedido");
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/orders"
              className="text-blue-600 hover:text-blue-700"
            >
              ← Voltar
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {order.order_number}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Detalhes do Pedido */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Status do Pedido</h2>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      ORDER_STATUS_COLORS[order.status] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                {order.status === "Pendente" && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={canceling}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {canceling ? "Cancelando..." : "Cancelar Pedido"}
                  </button>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Pedido em:</span>{" "}
                  {formatDate(order.created_at)}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Entrega prevista:</span>{" "}
                  {new Date(order.estimated_delivery).toLocaleDateString("pt-BR")}
                </p>
                {order.tracking_code && (
                  <p className="text-gray-600">
                    <span className="font-medium">Código de rastreio:</span>{" "}
                    {order.tracking_code}
                  </p>
                )}
              </div>
            </div>

            {/* Itens */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Itens do Pedido</h2>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.product_id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Quantidade: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600">
                          Preço unitário: R$ {item.product_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">
                          R$ {item.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Endereço de Entrega */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Endereço de Entrega</h2>
              <div className="text-gray-700">
                <p>{order.shipping_address.street}, {order.shipping_address.number}</p>
                {order.shipping_address.complement && (
                  <p>{order.shipping_address.complement}</p>
                )}
                <p>{order.shipping_address.neighborhood}</p>
                <p>
                  {order.shipping_address.city} - {order.shipping_address.state}
                </p>
                <p>CEP: {order.shipping_address.zip_code}</p>
              </div>
            </div>

            {/* Pagamento */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Método de Pagamento</h2>
              <p className="text-gray-700">{order.payment_method}</p>
            </div>
          </div>

          {/* Resumo */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Resumo</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    R$ {order.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className="font-semibold">
                    R$ {order.shipping_fee.toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      R$ {order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/orders"
                className="block w-full py-3 border border-gray-300 text-center rounded-lg hover:bg-gray-50"
              >
                Ver Todos os Pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}