"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ordersService, Order } from "@/app/services/orders";
import { authService } from "@/app/services/auth";
import { toast } from "react-hot-toast";
import Link from "next/link";
import NavbarDashboard from "@/app/components/dashboard/NavbarDashboard";
import Footer from "@/app/components/layout/Footer";
import { getPaymentMethodDisplay, PaymentMethodKey } from "@/app/utils/paymentMethods";
import {
  ShoppingBagIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  HomeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getUser();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error("Faça login para ver seus pedidos");
      router.push("/login");
      return;
    }
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await ordersService.getOrders();
      // Ordenar por data (mais recente primeiro)
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(data);
    } catch (error: any) {
      toast.error("Erro ao carregar pedidos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
      pending: {
        label: "Aguardando Pagamento",
        color: "text-yellow-700",
        bgColor: "bg-yellow-100",
        icon: ClockIcon,
      },
      processing: {
        label: "Processando",
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        icon: ArrowPathIcon,
      },
      shipped: {
        label: "Enviado",
        color: "text-purple-700",
        bgColor: "bg-purple-100",
        icon: TruckIcon,
      },
      delivered: {
        label: "Entregue",
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: CheckCircleIcon,
      },
      cancelled: {
        label: "Cancelado",
        color: "text-red-700",
        bgColor: "bg-red-100",
        icon: XCircleIcon,
      },
    };

    return configs[status] || configs.pending;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ✅ BACKGROUND IMAGE FIXO */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image-fundo-5.jpg')" }}
      />
      {/* Overlay escuro */}
      <div className="fixed inset-0 -z-10 bg-black/50" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavbarDashboard user={user} />

        <div className="flex-1 overflow-y-auto">
          <main className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all border border-white/20"
                >
                  <HomeIcon className="w-5 h-5" />
                  <span className="font-semibold">Voltar ao Dashboard</span>
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold text-yellow-400">
                  Meus Pedidos
                </h1>
              </div>
            </div>

            {/* Conteúdo */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
                  <p className="text-white font-semibold">Carregando pedidos...</p>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-white/20">
                <ShoppingBagIcon className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Nenhum pedido encontrado
                </h2>
                <p className="text-white/80 mb-6 text-lg">
                  Você ainda não fez nenhum pedido. Que tal começar a comprar?
                </p>
                <Link
                  href="/dashboard/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  Ver Produtos
                </Link>
              </div>
            ) : (
              <>
                <p className="text-white mb-6 text-lg font-semibold">
                  {orders.length} {orders.length === 1 ? "pedido encontrado" : "pedidos encontrados"}
                </p>

                <div className="space-y-6">
                  {orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={order.id}
                        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-200"
                      >
                        <div className="p-6">
                          {/* Header do Pedido */}
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-gray-200">
                            <div className="mb-4 md:mb-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="text-lg font-bold text-gray-900">
                                  Pedido #{order.id.slice(0, 8)}
                                </h3>
                                <span
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color} ${statusConfig.bgColor}`}
                                >
                                  <StatusIcon className="w-4 h-4" />
                                  {statusConfig.label}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Realizado em {formatDate(order.created_at)}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-green-600">
                                  R$ {order.total_amount.toFixed(2)}
                                </p>
                              </div>
                              <Link
                                href={`/orders/${order.id}`}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 font-bold transition-all shadow-md hover:shadow-lg"
                              >
                                <EyeIcon className="w-5 h-5" />
                                Detalhes
                              </Link>
                            </div>
                          </div>

                          {/* Itens do Pedido */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Itens ({order.items?.length || 0})
                            </h4>
                            {order.items?.slice(0, 3).map((item) => (
                              <div
                                key={item.product_id}
                                className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {item.product_name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Quantidade: {item.quantity} x R$ {item.price.toFixed(2)}
                                  </p>
                                </div>
                                <p className="font-bold text-gray-900">
                                  R$ {item.subtotal.toFixed(2)}
                                </p>
                              </div>
                            ))}

                            {order.items && order.items.length > 3 && (
                              <p className="text-sm text-gray-600 text-center font-semibold">
                                + {order.items.length - 3}{" "}
                                {order.items.length - 3 === 1 ? "item" : "itens"}
                              </p>
                            )}
                          </div>

                          {/* Endereço de Entrega */}
                          {order.shipping_address && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                                Endereço de Entrega
                              </h4>
                              <p className="text-sm text-gray-600">
                                {order.shipping_address.street}, {order.shipping_address.number}
                                {order.shipping_address.complement &&
                                  ` - ${order.shipping_address.complement}`}
                                <br />
                                {order.shipping_address.neighborhood},{" "}
                                {order.shipping_address.city} - {order.shipping_address.state}
                                <br />
                                CEP: {order.shipping_address.zip_code}
                              </p>
                            </div>
                          )}

                          {/* Método de Pagamento */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Pagamento:</span>{" "}
                              {order.payment_method
                                ? getPaymentMethodDisplay(order.payment_method as PaymentMethodKey)
                                : "Não informado"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="h-24"></div>
          </main>
        </div>

        <Footer />
      </div>
    </div>
  );
}