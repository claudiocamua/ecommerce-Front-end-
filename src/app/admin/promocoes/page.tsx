"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/services/auth";
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
  
  // Desconto percentual
  discount_percentage?: number;
  
  // Leve X Pague Y
  buy_quantity?: number;
  pay_quantity?: number;
  
  // Frete grátis
  min_purchase_amount?: number;
  
  // Cupom
  coupon_code?: string;
  coupon_discount_type?: "percentage" | "fixed";
  coupon_discount_value?: number;
  max_uses?: number;
  current_uses?: number;
  
  // Desconto progressivo
  progressive_tiers?: Array<{
    min_amount: number;
    discount_percentage: number;
  }>;
  
  // Filtros
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

export default function AdminPromocoesPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<Partial<Promotion>>({
    name: "",
    description: "",
    type: "percentage_discount",
    start_date: "",
    end_date: "",
    is_active: true,
    discount_percentage: 0,
    progressive_tiers: [],
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
  }, [promotions, searchTerm]);

  const loadPromotions = async () => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        router.push("/");
        return;
      }

      console.log('🔍 Carregando promoções do endpoint:', `${process.env.NEXT_PUBLIC_API_URL}/admin/promotions`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/promotions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na resposta:', errorData);
        throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Dados recebidos:', data);
      console.log('📊 Tipo dos dados:', typeof data, 'É array?', Array.isArray(data));
      
      // Garantir que sempre seja um array
      if (Array.isArray(data)) {
        setPromotions(data);
      } else if (data && typeof data === 'object' && Array.isArray(data.promotions)) {
        // Se a API retornar { promotions: [...] }
        setPromotions(data.promotions);
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        // Se a API retornar { data: [...] }
        setPromotions(data.data);
      } else {
        console.warn('⚠️ Dados em formato inesperado, usando array vazio');
        setPromotions([]);
      }
    } catch (error: any) {
      console.error("Erro detalhado ao carregar promoções:", error);
      toast.error(error.message || "Erro ao carregar promoções");
      // Garantir que sempre seja um array mesmo em caso de erro
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPromotions = () => {
    // Garantir que promotions é um array antes de filtrar
    if (!Array.isArray(promotions)) {
      console.warn('⚠️ promotions não é um array:', promotions);
      setFilteredPromotions([]);
      return;
    }

    let filtered = [...promotions];

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

    try {
      const token = authService.getToken();
      const url = editingPromotion
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/promotions/${editingPromotion._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/promotions`;

      const method = editingPromotion ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erro ao salvar promoção");

      toast.success(editingPromotion ? "Promoção atualizada!" : "Promoção criada!");
      setShowModal(false);
      resetForm();
      loadPromotions();
    } catch (error) {
      console.error("Erro ao salvar promoção:", error);
      toast.error("Erro ao salvar promoção");
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
      const token = authService.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/promotions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao excluir promoção");

      toast.success("Promoção excluída!");
      loadPromotions();
    } catch (error) {
      console.error("Erro ao excluir promoção:", error);
      toast.error("Erro ao excluir promoção");
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/promotions/${promotion._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...promotion,
            is_active: !promotion.is_active,
          }),
        }
      );

      if (!response.ok) throw new Error("Erro ao atualizar status");

      toast.success(
        promotion.is_active ? "Promoção desativada!" : "Promoção ativada!"
      );
      loadPromotions();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
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

  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date();
    const start = new Date(promotion.start_date);
    const end = new Date(promotion.end_date);
    return promotion.is_active && now >= start && now <= end;
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
        return `Cupom: ${promotion.coupon_code} (${promotion.coupon_discount_type === 'percentage' ? promotion.coupon_discount_value + '%' : 'R$ ' + promotion.coupon_discount_value})`;
      case "progressive_discount":
        return `Desconto progressivo (${promotion.progressive_tiers?.length || 0} níveis)`;
      default:
        return "";
    }
  };

  const stats = {
    total: Array.isArray(promotions) ? promotions.length : 0,
    active: Array.isArray(promotions) ? promotions.filter((p) => isPromotionActive(p)).length : 0,
    scheduled: Array.isArray(promotions) ? promotions.filter(
      (p) => p.is_active && new Date(p.start_date) > new Date()
    ).length : 0,
    expired: Array.isArray(promotions) ? promotions.filter(
      (p) => new Date(p.end_date) < new Date()
    ).length : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-700 ">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Gerenciar Promoções
              </h1>
              <p className="text-white">Crie e gerencie promoções da loja</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nova Promoção
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-800">Ativas</p>
            <p className="text-2xl font-bold text-green-900">{stats.active}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-blue-800">Agendadas</p>
            <p className="text-2xl font-bold text-blue-900">{stats.scheduled}</p>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-800">Expiradas</p>
            <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
          </div>
        </div>

        {/* Busca */}
        <div className="bg-white/50 rounded-lg shadow p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar promoções..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Lista de Promoções */}
        {filteredPromotions.length === 0 ? (
          <div className="bg-white/50 rounded-lg shadow p-12 text-center">
           
            <p className="text-white">Nenhuma promoção encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPromotions.map((promotion) => {
              const Icon = promotionTypeIcons[promotion.type];
              return (
                <div
                  key={promotion._id}
                  className="bg- rounded-lg shadow hover:shadow-lg transition"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <span className="text-xs text-gray-500">
                            {promotionTypeLabels[promotion.type]}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {promotion.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {promotion.description}
                        </p>
                        <div className="text-xl font-bold text-blue-600 mb-2">
                          {getPromotionSummary(promotion)}
                        </div>
                      </div>
                      {isPromotionActive(promotion) ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          Ativa
                        </span>
                      ) : new Date(promotion.start_date) > new Date() ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                          Agendada
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                          Expirada
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {formatDate(promotion.start_date)} até{" "}
                        {formatDate(promotion.end_date)}
                      </span>
                    </div>

                    {promotion.type === "coupon_code" && (
                      <div className="mb-4 p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600">
                          Usos: {promotion.current_uses || 0} / {promotion.max_uses || "∞"}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(promotion)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-2"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(promotion)}
                        className={`px-3 py-2 rounded flex items-center justify-center gap-2 ${
                          promotion.is_active
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
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
                        className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-700/80 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6">
                {editingPromotion ? "Editar Promoção" : "Nova Promoção"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Informações Básicas</h4>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Tipo de Promoção *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as PromotionType })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(promotionTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Nome da Promoção *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Black Friday 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Descrição *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva a promoção..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Data de Início *
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) =>
                          setFormData({ ...formData, start_date: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Data de Término *
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) =>
                          setFormData({ ...formData, end_date: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Configurações Específicas */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Configurações da Promoção</h4>

                  {/* Desconto Percentual */}
                  {formData.type === "percentage_discount" && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">
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
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Leve X Pague Y */}
                  {formData.type === "buy_x_pay_y" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
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
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">
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
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 2"
                        />
                      </div>
                    </div>
                  )}

                  {/* Frete Grátis */}
                  {formData.type === "free_shipping" && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">
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
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 200.00"
                      />
                    </div>
                  )}

                  {/* Cupom de Desconto */}
                  {formData.type === "coupon_code" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold mb-2">
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
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: BLACKFRIDAY2025"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
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
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="percentage">Percentual (%)</option>
                            <option value="fixed">Valor Fixo (R$)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">
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
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Máximo de Usos (deixe vazio para ilimitado)
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
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Ilimitado"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Usos por Usuário (deixe vazio para ilimitado)
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
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Ilimitado"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Desconto Progressivo */}
                  {formData.type === "progressive_discount" && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">
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
                              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="number"
                              value={tier.discount_percentage}
                              onChange={(e) =>
                                updateProgressiveTier(index, "discount_percentage", parseFloat(e.target.value))
                              }
                              placeholder="Desconto (%)"
                              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeProgressiveTier(index)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addProgressiveTier}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                        >
                          + Adicionar Nível
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Outras Configurações */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Outras Configurações</h4>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">
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
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="is_active" className="text-sm font-semibold">
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
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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