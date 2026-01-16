"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/services/auth";
import { promotionsService, type Promotion, type CreatePromotionData } from "@/app/services/promotions";
import { toast } from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  TagIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  GiftIcon,
  TruckIcon,
  TicketIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

type PromotionType = 
  | "percentage_discount"    // Desconto percentual
  | "buy_x_pay_y"           // Leve X Pague Y
  | "free_shipping"         // Frete grátis
  | "coupon_code"           // Cupom de desconto
  | "progressive_discount"; // Desconto progressivo

interface Promotion {
  _id: string;
  name: string;
  description: string;
  type: PromotionType;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  
  discount_percentage?: number;
  buy_quantity?: number;
  pay_quantity?: number;
  min_purchase_amount?: number;
  coupon_code?: string;
  coupon_discount_type?: "percentage" | "fixed";
  coupon_discount_value?: number;
  max_uses?: number;
  current_uses?: number;
  progressive_tiers?: Array<{
    min_amount: number;
    discount_percentage: number;
  }>;
  product_ids?: string[];
  category_ids?: string[];
  min_order_value?: number;
  max_uses_per_user?: number;
}

const promotionTypeLabels: Record<PromotionType, string> = {
  percentage_discount: "Desconto Percentual",
  buy_x_pay_y: "Leve X Pague Y",
  free_shipping: "Frete Grátis",
  coupon_code: "Cupom de Desconto",
  progressive_discount: "Desconto Progressivo",
};

const promotionTypeIcons: Record<PromotionType, any> = {
  percentage_discount: TagIcon,
  buy_x_pay_y: GiftIcon,
  free_shipping: TruckIcon,
  coupon_code: TicketIcon,
  progressive_discount: TagIcon,
};

const promotionTypeColors: Record<PromotionType, string> = {
  percentage_discount: "bg-blue-100 text-blue-800",
  buy_x_pay_y: "bg-purple-100 text-purple-800",
  free_shipping: "bg-green-100 text-green-800",
  coupon_code: "bg-yellow-100 text-yellow-800",
  progressive_discount: "bg-orange-100 text-orange-800",
};

export default function AdminPromocoesPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "scheduled" | "expired">("all");
  const [formData, setFormData] = useState<Partial<Promotion>>({
    name: "",
    description: "",
    type: "percentage_discount",
    start_date: "",
    end_date: "",
    is_active: true,
    discount_percentage: 0,
    progressive_tiers: [],
    min_purchase_amount: 0, // 🔥 ADICIONADO
    buy_quantity: 2, // 🔥 VALOR PADRÃO
    pay_quantity: 1, // 🔥 VALOR PADRÃO
  });

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await authService.getProfile();
        if (!profile?.is_admin) {
          toast.error("Acesso negado! Apenas administradores.");
          router.push("/dashboard");
          return;
        }
        loadPromotions();
      } catch (error) {
        console.error("Erro ao verificar admin:", error);
        toast.error("Erro ao verificar permissões");
        router.push("/dashboard");
      }
    };
    init();
  }, []);

  useEffect(() => {
    filterPromotions();
  }, [promotions, searchTerm, filterStatus]);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      
      const data = await promotionsService.getAll();
      console.log("✅ Promoções carregadas:", data);
      
      setPromotions(data);
      toast.success(`${data.length} promoções carregadas!`);
    } catch (error: any) {
      console.error("❌ Erro ao carregar promoções:", error);
      
      if (error.message === "Failed to fetch") {
        toast.error("Erro CORS! Verifique se backend está rodando.");
      } else if (error.response?.status === 401) {
        toast.error("Sessão expirada. Faça login novamente.");
        router.push("/auth");
      } else {
        toast.error(error.response?.data?.detail || "Erro ao carregar promoções");
      }
      
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPromotions = () => {
    if (!Array.isArray(promotions)) {
      setFilteredPromotions([]);
      return;
    }

    let filtered = [...promotions];

    // Filtro por status
    if (filterStatus !== "all") {
      filtered = filtered.filter((promo) => {
        const status = getPromotionStatus(promo);
        return status === filterStatus;
      });
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (promo) =>
          promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          promo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          promo.coupon_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPromotions(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      // 🔥 CONVERSÃO DE DATAS PARA ISO 8601
      const startDateISO = new Date(formData.start_date + "T00:00:00").toISOString();
      const endDateISO = new Date(formData.end_date + "T23:59:59").toISOString();

      const payload: CreatePromotionData = {
        name: formData.name!,
        description: formData.description!,
        type: formData.type!,
        start_date: startDateISO,
        end_date: endDateISO,
        is_active: formData.is_active,
      };

      // Adicionar campos específicos por tipo
      if (formData.type === "percentage_discount") {
        payload.discount_percentage = Number(formData.discount_percentage);
        if (formData.min_order_value) {
          payload.min_order_value = Number(formData.min_order_value);
        }
      } else if (formData.type === "buy_x_pay_y") {
        payload.buy_quantity = Number(formData.buy_quantity);
        payload.pay_quantity = Number(formData.pay_quantity);
        if (formData.product_ids) {
          payload.product_ids = formData.product_ids;
        }
      } else if (formData.type === "free_shipping") {
        payload.min_purchase_amount = Number(formData.min_purchase_amount);
      } else if (formData.type === "coupon_code") {
        payload.coupon_code = formData.coupon_code;
        payload.coupon_discount_type = formData.coupon_discount_type;
        payload.coupon_discount_value = Number(formData.coupon_discount_value);
        payload.max_uses = formData.max_uses;
        payload.max_uses_per_user = formData.max_uses_per_user;
        if (formData.min_order_value) {
          payload.min_order_value = Number(formData.min_order_value);
        }
      } else if (formData.type === "progressive_discount") {
        payload.progressive_tiers = formData.progressive_tiers;
      }

      console.log("📤 Enviando payload:", payload);

      let result: Promotion;
      if (editingPromotion) {
        result = await promotionsService.update(editingPromotion._id, payload);
        toast.success("✅ Promoção atualizada!");
      } else {
        result = await promotionsService.create(payload);
        toast.success("✅ Promoção criada!");
      }

      console.log("✅ Resposta:", result);
      
      setShowModal(false);
      resetForm();
      loadPromotions();
    } catch (error: any) {
      console.error("❌ Erro ao salvar promoção:", error);
      
      const errorMessage = error.response?.data?.detail || error.message || "Erro ao salvar promoção";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      ...promotion,
      start_date: promotion.start_date.split("T")[0],
      end_date: promotion.end_date.split("T")[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta promoção?")) return;

    try {
      await promotionsService.delete(id);
      toast.success("Promoção excluída!");
      loadPromotions();
    } catch (error: any) {
      console.error("Erro ao excluir promoção:", error);
      toast.error(error.response?.data?.detail || "Erro ao excluir promoção");
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    try {
      await promotionsService.update(promotion._id, {
        is_active: !promotion.is_active,
      });
      
      toast.success(
        promotion.is_active ? "Promoção desativada!" : "Promoção ativada!"
      );
      loadPromotions();
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      toast.error(error.response?.data?.detail || "Erro ao atualizar status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "percentage_discount",
      start_date: "",
      end_date: "",
      is_active: true,
      discount_percentage: 0,
      progressive_tiers: [],
      min_purchase_amount: 0, // 🔥 ADICIONADO
      buy_quantity: 2, // 🔥 ADICIONADO
      pay_quantity: 1, // 🔥 ADICIONADO
    });
    setEditingPromotion(null);
  };

  const addProgressiveTier = () => {
    setFormData({
      ...formData,
      progressive_tiers: [
        ...(formData.progressive_tiers || []),
        { min_amount: 0, discount_percentage: 0 },
      ],
    });
  };

  const removeProgressiveTier = (index: number) => {
    setFormData({
      ...formData,
      progressive_tiers: formData.progressive_tiers?.filter((_, i) => i !== index),
    });
  };

  const updateProgressiveTier = (index: number, field: string, value: number) => {
    const tiers = [...(formData.progressive_tiers || [])];
    tiers[index] = { ...tiers[index], [field]: value };
    setFormData({ ...formData, progressive_tiers: tiers });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getPromotionStatus = (promotion: Promotion): "active" | "scheduled" | "expired" => {
    const now = new Date();
    const start = new Date(promotion.start_date);
    const end = new Date(promotion.end_date);
    
    if (!promotion.is_active || end < now) return "expired";
    if (start > now) return "scheduled";
    return "active";
  };

  const getPromotionSummary = (promotion: Promotion) => {
    switch (promotion.type) {
      case "percentage_discount":
        return `${promotion.discount_percentage}% OFF`;
      case "buy_x_pay_y":
        return `Leve ${promotion.buy_quantity} Pague ${promotion.pay_quantity}`;
      case "free_shipping":
        return `Frete Grátis acima de R$ ${promotion.min_purchase_amount?.toFixed(2)}`;
      case "coupon_code":
        return `Cupom: ${promotion.coupon_code}`;
      case "progressive_discount":
        return `${promotion.progressive_tiers?.length || 0} níveis`;
      default:
        return "";
    }
  };

  const stats = {
    total: Array.isArray(promotions) ? promotions.length : 0,
    active: Array.isArray(promotions) ? promotions.filter((p) => getPromotionStatus(p) === "active").length : 0,
    scheduled: Array.isArray(promotions) ? promotions.filter((p) => getPromotionStatus(p) === "scheduled").length : 0,
    expired: Array.isArray(promotions) ? promotions.filter((p) => getPromotionStatus(p) === "expired").length : 0,
  };

  const validateForm = (): string | null => {
    // Validações gerais
    if (!formData.name || formData.name.length < 3) {
      return "Nome deve ter no mínimo 3 caracteres";
    }

    if (!formData.description || formData.description.length < 10) {
      return "Descrição deve ter no mínimo 10 caracteres";
    }

    if (!formData.start_date || !formData.end_date) {
      return "Datas de início e término são obrigatórias";
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      return "Data de término deve ser maior que data de início";
    }

    // Validações específicas por tipo
    switch (formData.type) {
      case "percentage_discount":
        if (!formData.discount_percentage || formData.discount_percentage <= 0) {
          return "Desconto percentual deve ser maior que 0";
        }
        if (formData.discount_percentage > 100) {
          return "Desconto percentual não pode ser maior que 100";
        }
        break;

      case "buy_x_pay_y":
        if (!formData.buy_quantity || formData.buy_quantity < 2) {
          return "Quantidade 'Leve' deve ser no mínimo 2";
        }
        if (!formData.pay_quantity || formData.pay_quantity < 1) {
          return "Quantidade 'Pague' deve ser no mínimo 1";
        }
        if (formData.pay_quantity >= formData.buy_quantity) {
          return "Quantidade 'Pague' deve ser menor que 'Leve'";
        }
        break;

      case "free_shipping":
        if (formData.min_purchase_amount === undefined || formData.min_purchase_amount < 0) {
          return "Valor mínimo deve ser 0 ou maior";
        }
        break;

      case "coupon_code":
        if (!formData.coupon_code || formData.coupon_code.length < 3) {
          return "Código do cupom deve ter no mínimo 3 caracteres";
        }
        if (!formData.coupon_discount_value || formData.coupon_discount_value <= 0) {
          return "Valor do desconto deve ser maior que 0";
        }
        if (formData.coupon_discount_type === "percentage" && formData.coupon_discount_value > 100) {
          return "Desconto percentual não pode ser maior que 100";
        }
        break;

      case "progressive_discount":
        if (!formData.progressive_tiers || formData.progressive_tiers.length < 2) {
          return "Desconto progressivo deve ter no mínimo 2 níveis";
        }
        for (const tier of formData.progressive_tiers) {
          if (tier.min_amount < 0) {
            return "Valor mínimo não pode ser negativo";
          }
          if (tier.discount_percentage <= 0 || tier.discount_percentage > 100) {
            return "Desconto deve estar entre 1 e 100";
          }
        }
        break;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white font-semibold">Carregando promoções...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="p-2 hover:bg-white/10 rounded-lg transition text-white"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <TicketIcon className="w-8 h-8" />
                Gerenciar Promoções
              </h1>
              <p className="text-gray-400">Crie e gerencie promoções da loja</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-lg transition-all duration-300 hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            Nova Promoção
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <TagIcon className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-gray-400">Total</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <p className="text-sm text-green-400">Ativas</p>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.active}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-5 h-5 text-blue-400" />
              <p className="text-sm text-blue-400">Agendadas</p>
            </div>
            <p className="text-3xl font-bold text-blue-400">{stats.scheduled}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-500/30">
            <div className="flex items-center gap-2 mb-2">
              <XCircleIcon className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-gray-400">Expiradas</p>
            </div>
            <p className="text-3xl font-bold text-gray-400">{stats.expired}</p>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar promoções..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  filterStatus === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  filterStatus === "active"
                    ? "bg-green-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                Ativas
              </button>
              <button
                onClick={() => setFilterStatus("scheduled")}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  filterStatus === "scheduled"
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                Agendadas
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Promoções */}
        {filteredPromotions.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg p-12 text-center border border-white/20">
            <TicketIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhuma promoção encontrada</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Criar primeira promoção
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPromotions.map((promotion) => {
              const Icon = promotionTypeIcons[promotion.type];
              const status = getPromotionStatus(promotion);
              
              return (
                <div
                  key={promotion._id}
                  className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20 hover:scale-105"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${promotionTypeColors[promotion.type]}`}>
                            <Icon className="w-3 h-3 inline mr-1" />
                            {promotionTypeLabels[promotion.type]}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          {promotion.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          {promotion.description}
                        </p>
                        <div className="text-xl font-bold text-blue-400 mb-2">
                          {getPromotionSummary(promotion)}
                        </div>
                      </div>
                      {status === "active" ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded border border-green-500/30">
                          Ativa
                        </span>
                      ) : status === "scheduled" ? (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded border border-blue-500/30">
                          Agendada
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-semibold rounded border border-gray-500/30">
                          Expirada
                        </span>
                      )}
                    </div>

                    {/* Datas */}
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 pb-4 border-b border-white/10">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}
                      </span>
                    </div>

                    {/* Info Cupom */}
                    {promotion.type === "coupon_code" && (
                      <div className="mb-4 p-3 bg-white/5 rounded border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Usos do cupom</p>
                        <p className="text-sm font-semibold text-white">
                          {promotion.current_uses || 0} / {promotion.max_uses || "∞"}
                        </p>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(promotion)}
                        className="flex-1 px-3 py-2 bg-white/10 text-white rounded hover:bg-white/20 flex items-center justify-center gap-2 transition"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(promotion)}
                        className={`px-3 py-2 rounded flex items-center justify-center gap-2 transition ${
                          promotion.is_active
                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                            : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        }`}
                      >
                        {promotion.is_active ? (
                          <XCircleIcon className="w-4 h-4" />
                        ) : (
                          <CheckCircleIcon className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(promotion._id)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 flex items-center justify-center transition"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
              <h3 className="text-2xl font-bold mb-6 text-white">
                {editingPromotion ? "Editar Promoção" : "Nova Promoção"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b border-white/20 pb-2 text-white">
                    Informações Básicas
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Tipo de Promoção *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as PromotionType })
                      }
                      required
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                    >
                      {Object.entries(promotionTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Nome da Promoção *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                      placeholder="Ex: Black Friday 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Descrição *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                      placeholder="Descreva a promoção..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Data de Início *
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) =>
                          setFormData({ ...formData, start_date: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Data de Término *
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) =>
                          setFormData({ ...formData, end_date: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Configurações Específicas */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b border-white/20 pb-2 text-white">
                    Configurações da Promoção
                  </h4>

                  {/* Desconto Percentual */}
                  {formData.type === "percentage_discount" && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Desconto (%) *
                      </label>
                      <input
                        type="number"
                        value={formData.discount_percentage || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discount_percentage: parseFloat(e.target.value),
                          })
                        }
                        required
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                      />
                    </div>
                  )}

                  {/* Leve X Pague Y */}
                  {formData.type === "buy_x_pay_y" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-300">
                          Leve Quantidade *
                        </label>
                        <input
                          type="number"
                          value={formData.buy_quantity || 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              buy_quantity: parseInt(e.target.value),
                            })
                          }
                          required
                          min="1"
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                          placeholder="Ex: 3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-300">
                          Pague Quantidade *
                        </label>
                        <input
                          type="number"
                          value={formData.pay_quantity || 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pay_quantity: parseInt(e.target.value),
                            })
                          }
                          required
                          min="1"
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                          placeholder="Ex: 2"
                        />
                      </div>
                    </div>
                  )}

                  {/* Frete Grátis */}
                  {formData.type === "free_shipping" && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Valor Mínimo da Compra (R$) *
                      </label>
                      <input
                        type="number"
                        value={formData.min_purchase_amount || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            min_purchase_amount: parseFloat(e.target.value),
                          })
                        }
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                        placeholder="Ex: 200.00"
                      />
                    </div>
                  )}

                  {/* Cupom de Desconto */}
                  {formData.type === "coupon_code" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-300">
                          Código do Cupom *
                        </label>
                        <input
                          type="text"
                          value={formData.coupon_code || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              coupon_code: e.target.value.toUpperCase(),
                            })
                          }
                          required
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                          placeholder="Ex: BLACKFRIDAY2025"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-300">
                            Tipo de Desconto *
                          </label>
                          <select
                            value={formData.coupon_discount_type || "percentage"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                coupon_discount_type: e.target.value as "percentage" | "fixed",
                              })
                            }
                            required
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                          >
                            <option value="percentage">Percentual (%)</option>
                            <option value="fixed">Valor Fixo (R$)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-300">
                            Valor do Desconto *
                          </label>
                          <input
                            type="number"
                            value={formData.coupon_discount_value || 0}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                coupon_discount_value: parseFloat(e.target.value),
                              })
                            }
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-300">
                            Máximo de Usos
                          </label>
                          <input
                            type="number"
                            value={formData.max_uses || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                max_uses: e.target.value ? parseInt(e.target.value) : undefined,
                              })
                            }
                            min="1"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                            placeholder="Ilimitado"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-300">
                            Usos por Usuário
                          </label>
                          <input
                            type="number"
                            value={formData.max_uses_per_user || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                max_uses_per_user: e.target.value ? parseInt(e.target.value) : undefined,
                              })
                            }
                            min="1"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                            placeholder="Ilimitado"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Desconto Progressivo */}
                  {formData.type === "progressive_discount" && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Níveis de Desconto
                      </label>
                      <div className="space-y-2">
                        {(formData.progressive_tiers || []).map((tier, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input
                              type="number"
                              value={tier.min_amount}
                              onChange={(e) =>
                                updateProgressiveTier(index, "min_amount", parseFloat(e.target.value))
                              }
                              placeholder="Valor mínimo (R$)"
                              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                            />
                            <input
                              type="number"
                              value={tier.discount_percentage}
                              onChange={(e) =>
                                updateProgressiveTier(index, "discount_percentage", parseFloat(e.target.value))
                              }
                              placeholder="Desconto (%)"
                              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                            />
                            <button
                              type="button"
                              onClick={() => removeProgressiveTier(index)}
                              className="px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addProgressiveTier}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition"
                        >
                          + Adicionar Nível
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Outras Configurações */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b border-white/20 pb-2 text-white">
                    Outras Configurações
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Valor Mínimo do Pedido (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.min_order_value || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          min_order_value: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                      placeholder="Sem mínimo"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-semibold text-gray-300">
                      Promoção ativa
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition"
                  >
                    {editingPromotion ? "Atualizar" : "Criar Promoção"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}