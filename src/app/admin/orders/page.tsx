"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ordersService, Order } from "@/app/services/orders";
import { authService } from "@/app/services/auth";
import { toast } from "react-hot-toast";
import { getPaymentMethodDisplay, PaymentMethodKey } from "@/app/utils/paymentMethods";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        // Buscar perfil atualizado
        const profile = await authService.getProfile();
        console.log("👤 Perfil do usuário:", profile);

        if (!profile?.is_admin) {
          toast.error("Acesso negado! Apenas administradores.");
          router.push("/dashboard");
          return;
        }

        loadOrders();
      } catch (error) {
        console.error("Erro ao verificar admin:", error);
        toast.error("Erro ao verificar permissões");
        router.push("/dashboard");
      }
    };

    init();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      console.log("Carregando pedidos...");
      const data = await ordersService.getAllOrders();
      console.log("Pedidos carregados:", data);
      console.log("Tipo dos dados:", typeof data, Array.isArray(data));
      console.log("Quantidade:", Array.isArray(data) ? data.length : 'não é array');
      
      if (Array.isArray(data)) {
        setOrders(data);
        console.log("Pedidos definidos no estado");
      } else {
        console.error("Dados não são um array:", data);
        setOrders([]);
      }
    } catch (error: any) {
      console.error("Erro ao carregar pedidos:", error);
      console.error("Response completo:", error?.response);
      console.error("Data:", error?.response?.data);
      console.error("Status:", error?.response?.status);
      
      const errorMessage = error?.response?.data?.detail || 
                        error?.response?.data?.message || 
                        error?.message || 
                        "Erro ao carregar pedidos";
      
      toast.error(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shipping_address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items?.some((item) =>
            item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    setFilteredOrders(filtered);
  };

  const handleConfirmPayment = async (orderId: string) => {
    try {
      await ordersService.confirmPayment(orderId);
      toast.success("Pagamento confirmado!");
      loadOrders();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Erro ao confirmar pagamento");
    }
  };

  const handleMarkAsShipped = async (orderId: string) => {
    try {
      await ordersService.markAsShipped(orderId, trackingCode);
      toast.success("Pedido marcado como enviado!");
      setShowModal(false);
      setTrackingCode("");
      loadOrders();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Erro ao marcar como enviado");
    }
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    try {
      await ordersService.markAsDelivered(orderId);
      toast.success("Pedido marcado como entregue!");
      loadOrders();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Erro ao marcar como entregue");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt("Motivo do cancelamento:");
    if (!reason) return;

    try {
      await ordersService.adminCancelOrder(orderId, reason);
      toast.success("Pedido cancelado!");
      loadOrders();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Erro ao cancelar pedido");
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      pending: {
        label: "Aguardando Pagamento",
        color: "bg-yellow-100 text-yellow-800",
        icon: ClockIcon,
      },
      processing: {
        label: "Processando",
        color: "bg-blue-100 text-blue-800",
        icon: ArrowPathIcon,
      },
      shipped: {
        label: "Enviado",
        color: "bg-purple-100 text-purple-800",
        icon: TruckIcon,
      },
      delivered: {
        label: "Entregue",
        color: "bg-green-100 text-green-800",
        icon: CheckCircleIcon,
      },
      cancelled: {
        label: "Cancelado",
        color: "bg-red-100 text-red-800",
        icon: XCircleIcon,
      },
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
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

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Pedidos</h1>
            <p className="text-gray-600">Painel de administração de pedidos</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-800">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-blue-800">Processando</p>
            <p className="text-2xl font-bold text-blue-900">{stats.processing}</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <p className="text-sm text-purple-800">Enviados</p>
            <p className="text-2xl font-bold text-purple-900">{stats.shipped}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-800">Entregues</p>
            <p className="text-2xl font-bold text-green-900">{stats.delivered}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por ID, cidade ou produto..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <FunnelIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Aguardando Pagamento</option>
                <option value="processing">Processando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Pedidos */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between mb-4 pb-4 border-b">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Pedido #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Cliente</p>
                      <p className="font-semibold">{order.user_id.slice(0, 8)}...</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pagamento</p>
                      <p className="font-semibold">
                        {getPaymentMethodDisplay(order.payment_method as PaymentMethodKey)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-xl font-bold text-blue-600">
                        R$ {(order.total_amount || order.total || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {order.shipping_address && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Endereço de Entrega</p>
                      <p className="text-sm">
                        {order.shipping_address.street}, {order.shipping_address.number} -{" "}
                        {order.shipping_address.city}/{order.shipping_address.state}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Ver Detalhes
                    </button>

                    {order.status === "pending" && (
                      <button
                        onClick={() => handleConfirmPayment(order.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Confirmar Pagamento
                      </button>
                    )}

                    {order.status === "processing" && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
                      >
                        <TruckIcon className="w-4 h-4" />
                        Marcar como Enviado
                      </button>
                    )}

                    {order.status === "shipped" && (
                      <button
                        onClick={() => handleMarkAsDelivered(order.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Marcar como Entregue
                      </button>
                    )}

                    {order.status !== "cancelled" && order.status !== "delivered" && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Cancelar Pedido
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Marcar como Enviado</h3>
              <p className="text-sm text-gray-600 mb-4">
                Pedido #{selectedOrder.id.slice(0, 8)}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Código de Rastreio (opcional)
                </label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Ex: BR123456789BR"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setTrackingCode("");
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleMarkAsShipped(selectedOrder.id)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Confirmar Envio
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}