"use client";

import { useState, useEffect } from "react";
import { ordersService, Order } from "@/app/services/orders";
import { authService } from "@/app/services/auth";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  ChartBarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TagIcon,
  CalendarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import NavbarDashboard from "@/app/components/dashboard/NavbarDashboard";
import Footer from "@/app/components/layout/Footer";
import ComingSoon from "@/app/components/dashboard/ComingSoon";

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface OrderStats {
  total_orders: number;
  total_spent: number;
  pending_orders: number;
  confirmed_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  average_order_value: number;
  total_items_purchased: number;
  favorite_category: string;
  last_order_date: string | null;
}

interface CategoryStat {
  category: string;
  count: number;
  total: number;
}

export default function EstatisticasPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!authService.isAuthenticated()) {
        toast.error("Faça login para acessar esta página");
        router.push("/login");
        return;
      }
      
      const userData = authService.getUser();
      setUser(userData);
      
      if (userData) {
        loadStatistics();
      }
    }
  }, [router]);

  // Função para normalizar status
  const normalizeStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      "pending": "Pendente",
      "confirmed": "Confirmado",
      "processing": "Processando",
      "shipped": "Enviado",
      "delivered": "Entregue",
      "cancelled": "Cancelado",
      "Pendente": "Pendente",
      "Confirmado": "Confirmado",
      "Processando": "Processando",
      "Enviado": "Enviado",
      "Entregue": "Entregue",
      "Cancelado": "Cancelado",
    };
    return statusMap[status] || status || "Pendente";
  };

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const data = await ordersService.getAllOrders();
      
      const orders = (Array.isArray(data) ? data : data.orders || []).map(order => ({
        ...order,
        status: normalizeStatus(order.status)
      }));

      const totalOrders = orders.length;
      const totalSpent = orders.reduce(
        (sum, order) => sum + (order.total || order.total_amount || 0),
        0
      );

      // Contagem por status
      const pendingOrders = orders.filter((o) => o.status === "Pendente").length;
      const confirmedOrders = orders.filter((o) => o.status === "Confirmado").length;
      const processingOrders = orders.filter((o) => o.status === "Processando").length;
      const shippedOrders = orders.filter((o) => o.status === "Enviado").length;
      const deliveredOrders = orders.filter((o) => o.status === "Entregue").length;
      const cancelledOrders = orders.filter((o) => o.status === "Cancelado").length;

      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      const totalItemsPurchased = orders.reduce(
        (sum, order) =>
          sum +
          (order.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0),
        0
      );
      // Cálculo da categoria favorita
      const categoryCount: Record<string, number> = {};
      orders.forEach((order) => {
        order.items?.forEach((item) => {
          const category = item.product_name?.split(" ")[0] || "Outros";
          categoryCount[category] = (categoryCount[category] || 0) + item.quantity;
        });
      });
       // Categoria favorita
      const favoriteCategory =
        Object.keys(categoryCount).length > 0
          ? Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0][0]
          : "Nenhuma";
      
      const lastOrderDate =
        orders.length > 0
          ? orders.sort(
              (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0].created_at
          : null;

      setStats({
        total_orders: totalOrders,
        total_spent: totalSpent,
        pending_orders: pendingOrders,
        confirmed_orders: confirmedOrders,
        processing_orders: processingOrders,
        shipped_orders: shippedOrders,
        delivered_orders: deliveredOrders,
        cancelled_orders: cancelledOrders,
        average_order_value: averageOrderValue,
        total_items_purchased: totalItemsPurchased,
        favorite_category: favoriteCategory,
        last_order_date: lastOrderDate,
      });

      const categoryTotals: Record<string, { count: number; total: number }> = {};
      orders.forEach((order) => {
        order.items?.forEach((item) => {
          const category = item.product_name?.split(" ")[0] || "Outros";
          if (!categoryTotals[category]) {
            categoryTotals[category] = { count: 0, total: 0 };
          }
          categoryTotals[category].count += item.quantity;
          categoryTotals[category].total += item.subtotal || 0;
        });
      });
      // Estatísticas por categoria
      const categoryStatsArray = Object.entries(categoryTotals)
        .map(([category, data]) => ({
          category,
          count: data.count,
          total: data.total,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setCategoryStats(categoryStatsArray);

      setRecentOrders(
        orders
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          .slice(0, 5)
      );
    } catch (error) {
      console.error(" Erro ao carregar estatísticas:", error);
      toast.error("Erro ao carregar estatísticas");
      setStats({
        total_orders: 0,
        total_spent: 0,
        pending_orders: 0,
        confirmed_orders: 0,
        processing_orders: 0,
        shipped_orders: 0,
        delivered_orders: 0,
        cancelled_orders: 0,
        average_order_value: 0,
        total_items_purchased: 0,
        favorite_category: "Nenhuma",
        last_order_date: null,
      });
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Pendente": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      "Confirmado": "bg-blue-500/20 text-blue-300 border-blue-500/30",
      "Processando": "bg-purple-500/20 text-purple-300 border-purple-500/30",
      "Enviado": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      "Entregue": "bg-green-500/20 text-green-300 border-green-500/30",
      "Cancelado": "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-200 font-semibold">{title}</h3>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-2">{subtitle}</p>}
    </div>
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mb-4"></div>
        <p className="text-white font-semibold">Carregando estatísticas...</p>
        <p className="text-gray-400 text-sm mt-2">
          Calculando seus dados de compras
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <NavbarDashboard user={user} />

      <div className="flex-1">
        <main className="py-8 px-4 md:px-8 lg:px-24 xl:px-32 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
              <ChartBarIcon className="w-8 h-8" />
              Minhas Estatísticas
            </h1>
          </div>

          <div className="mb-8">
            <ComingSoon />
          </div>

          {/* Estatísticas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total de Pedidos"
              value={stats?.total_orders || 0}
              icon={ShoppingBagIcon}
              color="text-blue-400"
            />
            <StatCard
              title="Total Gasto"
              value={`R$ ${(stats?.total_spent || 0).toFixed(2)}`}
              icon={CurrencyDollarIcon}
              color="text-green-400"
            />
            <StatCard
              title="Itens Comprados"
              value={stats?.total_items_purchased || 0}
              icon={TagIcon}
              color="text-purple-400"
            />
            <StatCard
              title="Ticket Médio"
              value={`R$ ${(stats?.average_order_value || 0).toFixed(2)}`}
              icon={ChartBarIcon}
              color="text-orange-400"
            />
          </div>

          {/* Status dos Pedidos */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-8 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TruckIcon className="w-6 h-6 text-blue-400" />
              Status dos Pedidos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <ClockIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-400">
                  {stats?.pending_orders || 0}
                </p>
                <p className="text-sm text-gray-300">Pendente</p>
              </div>
              <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <CheckCircleIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-400">
                  {stats?.confirmed_orders || 0}
                </p>
                <p className="text-sm text-gray-300">Confirmado</p>
              </div>
              <div className="text-center p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <ChartBarIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-400">
                  {stats?.processing_orders || 0}
                </p>
                <p className="text-sm text-gray-300">Processando</p>
              </div>
              <div className="text-center p-4 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                <TruckIcon className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-indigo-400">
                  {stats?.shipped_orders || 0}
                </p>
                <p className="text-sm text-gray-300">Enviado</p>
              </div>
              <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                <CheckCircleIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-400">
                  {stats?.delivered_orders || 0}
                </p>
                <p className="text-sm text-gray-300">Entregue</p>
              </div>
              <div className="text-center p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                <XCircleIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-400">
                  {stats?.cancelled_orders || 0}
                </p>
                <p className="text-sm text-gray-300">Cancelado</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Categorias */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TagIcon className="w-6 h-6 text-purple-400" />
                Top 5 Categorias
              </h2>
              {categoryStats.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Nenhuma compra realizada ainda
                </p>
              ) : (
                <div className="space-y-4">
                  {categoryStats.map((cat, index) => (
                    <div key={cat.category} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center border border-purple-500/50">
                        <span className="text-purple-300 font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-white">
                            {cat.category}
                          </span>
                          <span className="text-sm text-gray-400">
                            {cat.count} itens
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (cat.total /
                                  Math.max(...categoryStats.map((c) => c.total))) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          R$ {cat.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informações Adicionais */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-blue-400" />
                Informações Adicionais
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-400 mb-1">Categoria Favorita</p>
                  <p className="text-xl font-bold text-blue-400">
                    {stats?.favorite_category || "Nenhuma"}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-400 mb-1">Último Pedido</p>
                  <p className="text-xl font-bold text-green-400">
                    {stats?.last_order_date
                      ? formatDate(stats.last_order_date)
                      : "Nenhum pedido"}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-400 mb-1">Taxa de Entrega</p>
                  <p className="text-xl font-bold text-orange-400">
                    {stats?.total_orders
                      ? (
                          ((stats.delivered_orders || 0) / stats.total_orders) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pedidos Recentes */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-8 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ShoppingBagIcon className="w-6 h-6 text-blue-400" />
              Pedidos Recentes
            </h2>
            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Nenhum pedido encontrado
              </p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full text-left p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">
                          {order.order_number || `Pedido #${order.id.slice(0, 8)}`}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-400">
                          R$ {(order.total || order.total_amount || 0).toFixed(2)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">
                  {selectedOrder.order_number || `Pedido #${selectedOrder.id?.slice(0, 8) || 'N/A'}`}
                </h2>
                <p className="text-gray-400 text-sm">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-gray-400 text-sm mb-2">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>

              {/* Itens */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-bold text-white mb-4">Itens do Pedido</h3>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                        <div>
                          <p className="font-semibold text-white">{item.product_name || 'Produto'}</p>
                          <p className="text-sm text-gray-400">Quantidade: {item.quantity || 0}</p>
                        </div>
                        <p className="font-bold text-blue-400">
                          R$ {(item.subtotal || 0).toFixed(2)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">Nenhum item encontrado</p>
                  )}
                </div>
              </div>

              {/* Endereço */}
              {selectedOrder.shipping_address && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold text-white mb-3">Endereço de Entrega</h3>
                  <p className="text-gray-300 text-sm">
                    {selectedOrder.shipping_address.street || ''}, {selectedOrder.shipping_address.number || ''}
                    {selectedOrder.shipping_address.complement && ` - ${selectedOrder.shipping_address.complement}`}
                    <br />
                    {selectedOrder.shipping_address.neighborhood || ''} - {selectedOrder.shipping_address.city || ''}/{selectedOrder.shipping_address.state || ''}
                    <br />
                    CEP: {selectedOrder.shipping_address.zip_code || 'N/A'}
                  </p>
                </div>
              )}

              {/* Pagamento */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-bold text-white mb-3">Forma de Pagamento</h3>
                <p className="text-gray-300 capitalize">{selectedOrder.payment_method || 'Não informado'}</p>
              </div>

              {/* Total */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>R$ {(selectedOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {(selectedOrder.discount || 0) > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Desconto</span>
                      <span>- R$ {(selectedOrder.discount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-300">
                    <span>Frete</span>
                    <span>R$ {(selectedOrder.shipping_cost || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/20 pt-2 flex justify-between items-center">
                    <span className="text-xl font-bold text-white">Total</span>
                    <span className="text-2xl font-bold text-yellow-400">
                      R$ {(selectedOrder.total || selectedOrder.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-6 py-3 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 font-bold transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}