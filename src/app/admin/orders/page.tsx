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
  ChartBarIcon,
  PencilSquareIcon,
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [mounted, setMounted] = useState(false);

  // Estados do modal de edição
  const [editOrderStatus, setEditOrderStatus] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        if (!authService.isAuthenticated()) {
          toast.error("Faça login para acessar esta página");
          router.push("/auth");
          return;
        }

        const profile = await authService.getProfile();
        
        if (!profile?.is_admin) {
          toast.error("Acesso negado! Apenas administradores.");
          router.push("/dashboard");
          return;
        }

        await loadOrders();
      } catch (error) {
        console.error("Erro ao verificar admin:", error);
        toast.error("Erro ao verificar permissões");
        router.push("/dashboard");
      }
    };

    if (mounted) {
      init();
    }
  }, [router, mounted]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getAllOrders();
      
      if (Array.isArray(data)) {
        setOrders(data);
        setFilteredOrders(data);
      } else {
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error: any) {
      console.error(" Erro ao carregar pedidos:", error);
      toast.error("Erro ao carregar pedidos");
      setOrders([]);
      setFilteredOrders([]);
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
          order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shipping_address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items?.some((item) =>
            item.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    setFilteredOrders(filtered);
  };

  const handleOpenEditModal = (order: Order) => {
    setSelectedOrder(order);
    setEditOrderStatus(order.status);
    setEditPaymentStatus(order.payment_status || "pending");
    setEditPaymentMethod(order.payment_method);
    setShowEditModal(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      const updateData: any = {};
      
      if (editOrderStatus !== selectedOrder.status) {
        updateData.status = editOrderStatus;
      }
      
      if (editPaymentStatus !== (selectedOrder.payment_status || "pending")) {
        updateData.payment_status = editPaymentStatus;
      }
      
      if (editPaymentMethod !== selectedOrder.payment_method) {
        updateData.payment_method = editPaymentMethod;
      }

      if (Object.keys(updateData).length === 0) {
        toast.error("Nenhuma alteração detectada");
        return;
      }

      await ordersService.updateOrder(selectedOrder.id, updateData);
      toast.success("Pedido atualizado com sucesso!");
      setShowEditModal(false);
      loadOrders();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Erro ao atualizar pedido");
    }
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
        color: "bg-yellow-500/20 text-yellow-300 border-yellow-400/50",
        icon: ClockIcon,
      },
      processing: {
        label: "Processando",
        color: "bg-blue-500/20 text-blue-300 border-blue-400/50",
        icon: ArrowPathIcon,
      },
      shipped: {
        label: "Enviado",
        color: "bg-purple-500/20 text-purple-300 border-purple-400/50",
        icon: TruckIcon,
      },
      delivered: {
        label: "Entregue",
        color: "bg-green-500/20 text-green-300 border-green-400/50",
        icon: CheckCircleIcon,
      },
      cancelled: {
        label: "Cancelado",
        color: "bg-red-500/20 text-red-300 border-red-400/50",
        icon: XCircleIcon,
      },
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      pending: {
        label: "Aguardando",
        color: "bg-yellow-500/20 text-yellow-300 border-yellow-400/50",
      },
      paid: {
        label: "Pago",
        color: "bg-green-500/20 text-green-300 border-green-400/50",
      },
      failed: {
        label: "Falhou",
        color: "bg-red-500/20 text-red-300 border-red-400/50",
      },
      refunded: {
        label: "Reembolsado",
        color: "bg-gray-500/20 text-gray-300 border-gray-400/50",
      },
    };

    const config = configs[status] || configs.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data inválida";
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Data inválida";
    }
  };

  const formatUserId = (userId: any) => {
    if (!userId) return "N/A";
    const userIdStr = String(userId);
    return userIdStr.length > 8 ? `${userIdStr.slice(0, 8)}...` : userIdStr;
  };

  const formatOrderId = (orderId: any) => {
    if (!orderId) return "N/A";
    const orderIdStr = String(orderId);
    return orderIdStr.length > 8 ? orderIdStr.slice(0, 8) : orderIdStr;
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    totalRevenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (o.total_amount || o.total || 0), 0),
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white font-semibold text-lg">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image-fundo-4.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/50" />

      <div className="relative z-10 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/admin")}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <ArrowLeftIcon className="w-6 h-6 text-white" />
                </button>
                <div>
                  <h1 className="text-4xl font-bold text-yellow-400 mb-1">
                    📦 Gerenciar Pedidos
                  </h1>
                  <p className="text-white/80">Painel de administração de pedidos</p>
                </div>
              </div>
              <button
                onClick={loadOrders}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20 flex items-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Atualizar
              </button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/70 text-sm font-medium">Total de Pedidos</p>
                <ChartBarIcon className="w-5 h-5 text-white/60" />
              </div>
              <p className="text-4xl font-bold text-white">{stats.total}</p>
            </div>

            <div className="bg-yellow-500/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-yellow-400/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-yellow-200 text-sm font-medium">Pendentes</p>
                <ClockIcon className="w-5 h-5 text-yellow-300" />
              </div>
              <p className="text-4xl font-bold text-yellow-400">{stats.pending}</p>
            </div>

            <div className="bg-blue-500/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-blue-400/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-200 text-sm font-medium">Processando</p>
                <ArrowPathIcon className="w-5 h-5 text-blue-300" />
              </div>
              <p className="text-4xl font-bold text-blue-400">{stats.processing}</p>
            </div>

            <div className="bg-green-500/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-green-400/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-200 text-sm font-medium">Receita Total</p>
                <CheckCircleIcon className="w-5 h-5 text-green-300" />
              </div>
              <p className="text-2xl font-bold text-green-400">
                R$ {stats.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 mb-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por ID, cidade ou produto..."
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>

              <div className="relative">
                <FunnelIcon className="absolute left-4 top-3.5 w-5 h-5 text-white/60" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-gray-900">Todos os Status</option>
                  <option value="pending" className="bg-gray-900">Aguardando Pagamento</option>
                  <option value="processing" className="bg-gray-900">Processando</option>
                  <option value="shipped" className="bg-gray-900">Enviado</option>
                  <option value="delivered" className="bg-gray-900">Entregue</option>
                  <option value="cancelled" className="bg-gray-900">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Pedidos */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-white/20">
              <div className="flex justify-center mb-6">
                <div className="bg-white/10 p-6 rounded-full">
                  <svg
                    className="w-16 h-16 text-white/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-white/70">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Ainda não há pedidos no sistema"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order, index) => (
                <div
                  key={order.id || order._id || `order-${index}`}
                  className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl hover:bg-white/15 transition-all border border-white/20 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between mb-4 pb-4 border-b border-white/20">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          Pedido #{formatOrderId(order.id)}
                        </h3>
                        <p className="text-sm text-white/70">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.payment_status || "pending")}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-sm text-white/70 mb-1">Cliente</p>
                        <p className="font-semibold text-white">{formatUserId(order.user_id)}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-sm text-white/70 mb-1">Pagamento</p>
                        <p className="font-semibold text-white">
                          {getPaymentMethodDisplay(order.payment_method as PaymentMethodKey)}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-sm text-white/70 mb-1">Total</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          R$ {(order.total_amount || order.total || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {order.shipping_address && (
                      <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                        <p className="text-sm text-white/70 mb-2">📍 Endereço de Entrega</p>
                        <p className="text-white">
                          {order.shipping_address.street}, {order.shipping_address.number}
                          {order.shipping_address.complement && ` - ${order.shipping_address.complement}`}
                          <br />
                          {order.shipping_address.neighborhood} - {order.shipping_address.city}/{order.shipping_address.state}
                          <br />
                          CEP: {order.shipping_address.zip_code}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20 flex items-center gap-2 font-semibold"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Ver Detalhes
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(order)}
                        className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-xl transition-all border border-orange-400/50 flex items-center gap-2 font-semibold"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Editar Pedido
                      </button>

                      {order.status === "pending" && (
                        <button
                          onClick={() => handleConfirmPayment(order.id)}
                          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-xl transition-all border border-green-400/50 flex items-center gap-2 font-semibold"
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
                          className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl transition-all border border-purple-400/50 flex items-center gap-2 font-semibold"
                        >
                          <TruckIcon className="w-4 h-4" />
                          Marcar como Enviado
                        </button>
                      )}

                      {order.status === "shipped" && (
                        <button
                          onClick={() => handleMarkAsDelivered(order.id)}
                          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl transition-all border border-blue-400/50 flex items-center gap-2 font-semibold"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          Marcar como Entregue
                        </button>
                      )}

                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all border border-red-400/50 flex items-center gap-2 font-semibold"
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

          {/* Modal de Rastreio */}
          {showModal && selectedOrder && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-2xl font-bold text-white mb-4">
                   Marcar como Enviado
                </h3>
                <p className="text-white/70 mb-6">
                  Pedido #{formatOrderId(selectedOrder.id)}
                </p>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Código de Rastreio (opcional)
                  </label>
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Ex: BR123456789BR"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setTrackingCode("");
                    }}
                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleMarkAsShipped(selectedOrder.id)}
                    className="flex-1 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-purple-300 rounded-xl font-semibold transition-all"
                  >
                    Confirmar Envio
                  </button>
                </div>
              </div>
            </div>
          )}

          {showEditModal && selectedOrder && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl max-w-lg w-full p-6">
                <h3 className="text-2xl font-bold text-white mb-4">
                   Editar Pedido
                </h3>
                <p className="text-white/70 mb-6">
                  Pedido #{formatOrderId(selectedOrder.id)}
                </p>

                <div className="space-y-4 mb-6">
                  {/* Status do Pedido */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Status do Pedido
                    </label>
                    <select
                      value={editOrderStatus}
                      onChange={(e) => setEditOrderStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="pending" className="bg-gray-900">Pendente</option>
                      <option value="processing" className="bg-gray-900">Processando</option>
                      <option value="shipped" className="bg-gray-900">Enviado</option>
                      <option value="delivered" className="bg-gray-900">Entregue</option>
                      <option value="cancelled" className="bg-gray-900">Cancelado</option>
                    </select>
                  </div>

                  {/* Status de Pagamento */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Status de Pagamento
                    </label>
                    <select
                      value={editPaymentStatus}
                      onChange={(e) => setEditPaymentStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="pending" className="bg-gray-900">Aguardando pagamento</option>
                      <option value="paid" className="bg-gray-900">Pago</option>
                      <option value="failed" className="bg-gray-900">Falhou</option>
                      <option value="refunded" className="bg-gray-900">Reembolsado</option>
                    </select>
                  </div>

                  {/* Método de Pagamento */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Método de Pagamento
                    </label>
                    <select
                      value={editPaymentMethod}
                      onChange={(e) => setEditPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="pix" className="bg-gray-900">PIX</option>
                      <option value="credit_card" className="bg-gray-900">Cartão de crédito</option>
                      <option value="debit_card" className="bg-gray-900">Cartão de débito</option>
                      <option value="boleto" className="bg-gray-900">Boleto</option>
                      <option value="cash" className="bg-gray-900">Dinheiro</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpdateOrder}
                    className="flex-1 px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/50 text-orange-300 rounded-xl font-semibold transition-all"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}