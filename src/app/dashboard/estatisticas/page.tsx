"use client";

import { useState, useEffect } from "react";
import { ordersService, Order } from "@/app/services/orders";
import { authService } from "@/app/services/auth";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChartBarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  TagIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import NavbarDashboard from "@/app/components/dashboard/NavbarDashboard";
import Footer from "@/app/components/layout/Footer";
import ComingSoon from "@/app/components/dashboard/ComingSoon";
import { useBackground } from "@/app/hooks/useBackground";

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

  const { backgroundUrl, loading: bgLoading } = useBackground("dashboard");

  useEffect(() => {
    // Verificar autenticação e carregar usuário apenas no cliente
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

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const data = await ordersService.getMyOrders({
        page: 1,
        page_size: 100,
      });

      const orders = data.orders;
      const totalOrders = orders.length;
      const totalSpent = orders.reduce(
        (sum, order) => sum + (order.total || order.total_amount || 0),
        0
      );

      const pendingOrders = orders.filter((o) => o.status === "Pendente").length;
      const confirmedOrders = orders.filter((o) => o.status === "Confirmado").length;
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

      const categoryCount: Record<string, number> = {};
      orders.forEach((order) => {
        order.items?.forEach((item) => {
          const category = item.product_name.split(" ")[0];
          categoryCount[category] = (categoryCount[category] || 0) + item.quantity;
        });
      });

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
          const category = item.product_name.split(" ")[0];
          if (!categoryTotals[category]) {
            categoryTotals[category] = { count: 0, total: 0 };
          }
          categoryTotals[category].count += item.quantity;
          categoryTotals[category].total += item.subtotal;
        });
      });

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
      toast.error("Erro ao carregar estatísticas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
    <div className="bg-white/50 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 font-semibold">{title}</h3>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );

  if (loading || bgLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mb-4"></div>
        <p className="text-white font-semibold">Carregando estatísticas...</p>
        <p className="text-gray-400 text-sm mt-2">
          Calculando seus dados de compras
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <div className="absolute inset-0 bg-black/50 pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavbarDashboard user={user} />

        <div className="flex-1">
          <main className="py-8 px-4 md:px-8 lg:px-24 xl:px-32 max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
                <ChartBarIcon className="w-8 h-8" />
                Minhas Estatísticas
              </h1>
            </div>

            {/* Botões Animados Laterais */}
            <div className="mb-8">
              <ComingSoon />
            </div>

            {/* Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total de Pedidos"
                value={stats?.total_orders || 0}
                icon={ShoppingBagIcon}
                color="text-blue-600"
              />
              <StatCard
                title="Total Gasto"
                value={`R$ ${(stats?.total_spent || 0).toFixed(2)}`}
                icon={CurrencyDollarIcon}
                color="text-green-600"
              />
              <StatCard
                title="Itens Comprados"
                value={stats?.total_items_purchased || 0}
                icon={TagIcon}
                color="text-purple-600"
              />
              <StatCard
                title="Ticket Médio"
                value={`R$ ${(stats?.average_order_value || 0).toFixed(2)}`}
                icon={ChartBarIcon}
                color="text-orange-600"
              />
            </div>

            {/* Status dos Pedidos */}
            <div className="bg-white/50 rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TruckIcon className="w-6 h-6 text-blue-600" />
                Status dos Pedidos
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <ClockIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats?.pending_orders || 0}
                  </p>
                  <p className="text-sm text-gray-600">Pendente</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <CheckCircleIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {stats?.confirmed_orders || 0}
                  </p>
                  <p className="text-sm text-gray-600">Confirmado</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <TruckIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">
                    {stats?.shipped_orders || 0}
                  </p>
                  <p className="text-sm text-gray-600">Enviado</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {stats?.delivered_orders || 0}
                  </p>
                  <p className="text-sm text-gray-600">Entregue</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircleIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">
                    {stats?.cancelled_orders || 0}
                  </p>
                  <p className="text-sm text-gray-600">Cancelado</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Top Categorias */}
              <div className="bg-white/50 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TagIcon className="w-6 h-6 text-purple-600" />
                  Top 5 Categorias
                </h2>
                {categoryStats.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhuma compra realizada ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {categoryStats.map((cat, index) => (
                      <div key={cat.category} className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-gray-900">
                              {cat.category}
                            </span>
                            <span className="text-sm text-gray-600">
                              {cat.count} itens
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (cat.total /
                                    Math.max(...categoryStats.map((c) => c.total))) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            R$ {cat.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Informações Adicionais */}
              <div className="bg-white/50 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                  Informações Adicionais
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-white/50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Categoria Favorita</p>
                    <p className="text-xl font-bold text-blue-600">
                      {stats?.favorite_category || "Nenhuma"}
                    </p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Último Pedido</p>
                    <p className="text-xl font-bold text-green-600">
                      {stats?.last_order_date
                        ? formatDate(stats.last_order_date)
                        : "Nenhum pedido"}
                    </p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Taxa de Entrega</p>
                    <p className="text-xl font-bold text-orange-600">
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
            <div className="bg-white/50 rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
                Pedidos Recentes
              </h2>
              {recentOrders.length === 0 ? (
                <p className="text-black text-center py-8">
                  Nenhum pedido encontrado
                </p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {order.order_number || `Pedido #${order.id.slice(0, 8)}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">
                            R$ {(order.total || order.total_amount || 0).toFixed(2)}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              order.status === "Entregue"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Cancelado"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </div>
  );
}