"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavbarDashboard from "@/app/components/dashboard/NavbarDashboard";
import Footer from "@/app/components/layout/Footer";
import { authService } from "@/app/services/auth";
import { toast } from "react-hot-toast";

interface OrderItem {
  id: number | string; 
  product_id: number | string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number | string; 
  user_id: number | string;
  status: string;
  total: number;
  created_at: string;
  items?: OrderItem[];
  payment_status?: string; 
  payment_method?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "total">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // Estado para controlar a exibição dos detalhes do pedido
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          toast.error("Faça login para acessar seus pedidos");
          router.push("/auth");
          return;
        }
        let userData = authService.getUser();
        
        if (!userData) {
          userData = await authService.getProfile();
          authService.saveUser(userData);
        }

        setUser(userData);
        
        await fetchOrders();
      } catch (error: any) {
        console.error("Erro ao verificar autenticação:", error);
        toast.error("Sessão expirada. Faça login novamente.");
        authService.logout();
        router.push("/auth");
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    let result = [...orders];

    if (filterStatus !== "all") {
      result = result.filter((order) => order.status === filterStatus);
    }

    if (searchTerm) {
      result = result.filter((order) =>
        String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) 
      );
    }

    result.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === "asc" ? a.total - b.total : b.total - a.total;
      }
    });

    setFilteredOrders(result);
  }, [orders, filterStatus, searchTerm, sortBy, sortOrder]);

  // Função para buscar pedidos da API
  const fetchOrders = async () => {
    try {
      const token = authService.getToken(); 

      if (!token) {
        router.push("/auth");
        return;
      }

      console.log("[ORDERS PAGE]  Buscando pedidos do FastAPI...");
      console.log("[ORDERS PAGE]  URL:", `${API_URL}/orders`);

      const response = await fetch(`${API_URL}/orders`, { 
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[ORDERS PAGE]  Status:", response.status);

      if (response.status === 401) {
        authService.logout(); 
        router.push("/auth");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Erro ao buscar pedidos");
      }
     
      const data = await response.json();
      console.log("[ORDERS PAGE]  Pedidos recebidos:", data);

      let ordersList: any[] = [];
      
      if (Array.isArray(data)) {
        ordersList = data;
      } else if (data.orders && Array.isArray(data.orders)) {
        ordersList = data.orders;
      }

      console.log("[ORDERS PAGE]  Total de pedidos:", ordersList.length);

      console.log("[ORDERS PAGE]  Verificando IDs dos pedidos:");
      ordersList.forEach((order: any, index: number) => {
        console.log(`  Pedido ${index}:`, {
          _id: order._id,
          id: order.id,
          status: order.status,
          total: order.total_amount || order.total
        });
      });

      const mappedOrders = ordersList.map((order: any, index: number) => {
        //  GERAR ID ÚNICO BASEADO NO ÍNDICE + TIMESTAMP
        const uniqueId = order._id || order.id || `temp-${Date.now()}-${index}`;
        
        return {
          id: String(uniqueId),
          user_id: order.user_id,
          status: order.status,
          total: order.total_amount || order.total,
          created_at: order.created_at,
          items: order.items || [],
          payment_status: order.payment_status,
          payment_method: order.payment_method,
        };
      });

      console.log("[ORDERS PAGE]  Pedidos mapeados:", mappedOrders.length);
      console.log("[ORDERS PAGE]  IDs dos pedidos:", mappedOrders.map(o => o.id)); 

      setOrders(mappedOrders);
    } catch (err: any) {
      console.error("[ORDERS PAGE]  Erro ao buscar pedidos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-400/50";
      case "processing":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/50";
      case "pending":
        return "bg-blue-500/20 text-blue-300 border-blue-400/50";
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-400/50";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/50";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: "Concluído",
      processing: "Processando",
      pending: "Pendente",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const calculateTotalOrders = () => orders.length;
  const calculateTotalSpent = () =>
    orders.reduce((sum, order) => sum + order.total, 0);
  const calculateAverageOrder = () => {
    const total = calculateTotalSpent();
    return orders.length > 0 ? total / orders.length : 0;
  };

  // Renderização enquanto carrega
  if (loading || !user) {
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
              <p className="text-white font-semibold">Carregando pedidos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 text-center shadow-2xl border border-white/20 max-w-md">
              <div className="flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mx-auto mb-4 border-2 border-red-400/50">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Erro ao carregar pedidos
              </h2>
              <p className="text-white/80 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg"
              >
                Tentar novamente
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
          {!filteredOrders || filteredOrders.length === 0 ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 text-center shadow-2xl border border-white/20 max-w-md">
                <div className="flex justify-center mb-6">
                  <svg
                    className="w-20 h-20 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Nenhum pedido encontrado
                </h2>
                <p className="text-white/80 mb-8 text-lg">
                  {searchTerm || filterStatus !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Você ainda não fez nenhum pedido"}
                </p>
                {!searchTerm && filterStatus === "all" && (
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="inline-block px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Ver Produtos
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="min-h-screen py-8">
              <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 text-center">
                    Meus Pedidos
                  </h1>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm font-medium mb-1">
                          Total de Pedidos
                        </p>
                        <p className="text-4xl font-bold text-white">
                          {calculateTotalOrders()}
                        </p>
                      </div>
                      <div className="bg-blue-500/20 p-4 rounded-xl border border-blue-400/30">
                        <svg
                          className="w-8 h-8 text-blue-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm font-medium mb-1">
                          Total Gasto
                        </p>
                        <p className="text-4xl font-bold text-white">
                          R$ {calculateTotalSpent().toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-green-500/20 p-4 rounded-xl border border-green-400/30">
                        <svg
                          className="w-8 h-8 text-green-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm font-medium mb-1">
                          Ticket Médio
                        </p>
                        <p className="text-4xl font-bold text-white">
                          R$ {calculateAverageOrder().toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-purple-500/20 p-4 rounded-xl border border-purple-400/30">
                        <svg
                          className="w-8 h-8 text-purple-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filtros */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 mb-8 border border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        Buscar por ID
                      </label>
                      <input
                        type="text"
                        placeholder="Digite o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        Status
                      </label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      >
                        <option value="all" className="bg-gray-900">Todos</option>
                        <option value="pending" className="bg-gray-900">Pendente</option>
                        <option value="processing" className="bg-gray-900">Processando</option>
                        <option value="completed" className="bg-gray-900">Concluído</option>
                        <option value="cancelled" className="bg-gray-900">Cancelado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        Ordenar por
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "date" | "total")}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      >
                        <option value="date" className="bg-gray-900">Data</option>
                        <option value="total" className="bg-gray-900">Valor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        Ordem
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      >
                        <option value="desc" className="bg-gray-900">Decrescente</option>
                        <option value="asc" className="bg-gray-900">Crescente</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tabela de Pedidos */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-white/90 uppercase">
                            ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-white/90 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-white/90 uppercase">
                            Total
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-white/90 uppercase">
                            Data
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-white/90 uppercase">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredOrders.map((order) => (
                          <tr
                            key={String(order.id)} 
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-white">
                                #{String(order.id).slice(-8)} 
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {getStatusLabel(order.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-bold text-white">
                                R$ {order.total.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                              {new Date(order.created_at).toLocaleDateString("pt-BR")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-yellow-400 hover:text-yellow-300 font-semibold text-sm transition-colors"
                              >
                                Ver detalhes
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl max-w-2xl w-full">
              <div className="p-6 border-b border-white/20">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Pedido #{String(selectedOrder.id).slice(-8)} 
                    </h2>
                    <p className="text-white/70">
                      {new Date(selectedOrder.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-white/60 hover:text-white bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <span className={`px-4 py-2 text-sm font-medium rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between mb-2">
                    <span className="text-white/70">ID do Usuário:</span>
                    <span className="font-semibold text-white">#{selectedOrder.user_id}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-lg font-semibold text-white">Total:</span>
                    <span className="text-lg font-bold text-yellow-400">
                      R$ {selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Fechar
                </button>
                <button
                  onClick={() => toast.error("Funcionalidade em desenvolvimento")}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-300 px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Cancelar Pedido
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}