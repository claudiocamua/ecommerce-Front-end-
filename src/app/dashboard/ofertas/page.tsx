"use client";

import { useState, useEffect } from "react";
import { productsService } from "@/app/services/products";
import { authService } from "@/app/services/auth";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  TagIcon,
  FireIcon,
  CubeIcon,
  FunnelIcon,
  GiftIcon,
  SparklesIcon,
  TruckIcon,
  TicketIcon,
  CalendarIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import NavbarDashboard from "@/app/components/dashboard/NavbarDashboard";
import Footer from "@/app/components/layout/Footer";
import ComingSoon from "@/app/components/dashboard/ComingSoon";
import ProductModal from "@/app/components/ProductModal";
import { cartService } from "@/app/services/cart";

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  discount_percentage?: number;
  stock: number;
  category: string;
  brand: string;
  image_urls: string[];
  created_at: string;
}

type PromotionType = 
  | "percentage_discount"
  | "buy_x_pay_y"
  | "free_shipping"
  | "coupon_code"
  | "progressive_discount";

interface Promotion {
  _id: string;
  name: string;
  description: string;
  type: PromotionType;
  start_date: string;
  end_date: string;
  is_active: boolean;
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
  min_order_value?: number;
}
// Imagem de fundo para a página de ofertas
const OFERTAS_BACKGROUND = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&q=80";
// Mapeamentos para tipos de promoção
const promotionTypeIcons: Record<PromotionType, any> = {
  percentage_discount: TagIcon,
  buy_x_pay_y: GiftIcon,
  free_shipping: TruckIcon,
  coupon_code: TicketIcon,
  progressive_discount: SparklesIcon,
};

const promotionTypeColors: Record<PromotionType, string> = {
  percentage_discount: "from-blue-500 to-blue-700",
  buy_x_pay_y: "from-purple-500 to-pink-600",
  free_shipping: "from-green-500 to-emerald-600",
  coupon_code: "from-yellow-500 to-orange-600",
  progressive_discount: "from-red-500 to-rose-600",
};
// Rótulos para tipos de promoção
const promotionTypeLabels: Record<PromotionType, string> = {
  percentage_discount: "Desconto Percentual",
  buy_x_pay_y: "Leve X Pague Y",
  free_shipping: "Frete Grátis",
  coupon_code: "Cupom de Desconto",
  progressive_discount: "Desconto Progressivo",
};

export default function OfertasPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"discount" | "price">("discount");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const getImageUrl = (imageUrl: string): string | null => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${baseURL}${imageUrl}`;
    return `${baseURL}/${imageUrl}`;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!authService.isAuthenticated()) {
        toast.error("Faça login para acessar esta página");
        router.push("/login");
        return;
      }
      const userData = authService.getUser();
      setUser(userData);
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      loadProducts();
      loadPromotions();
    }
  }, [sortBy, user]);

  const loadPromotions = async () => {
    try {
      const response = await fetch("http://localhost:8000/promotions", {
        headers: { Authorization: `Bearer ${authService.getToken()}` },
      });
      if (!response.ok) throw new Error("Erro ao buscar promoções");
      const data = await response.json();
      const now = new Date();
      const activePromotions = data.filter((promo: Promotion) => {
        const start = new Date(promo.start_date);
        const end = new Date(promo.end_date);
        return promo.is_active && start <= now && end >= now;
      });
      setPromotions(activePromotions);
      if (activePromotions.length > 0) {
        toast.success(`${activePromotions.length} promoções ativas encontradas!`);
      }
    } catch (error) {
      console.error(" Erro ao carregar promoções:", error);
      setPromotions([]);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsService.getProducts();
      if (!data.products || data.products.length === 0) {
        setProducts([]);
        return;
      }
      // Filtrar produtos com desconto
      const productsWithDiscount = data.products
        .filter((p: Product) => (p.discount && p.discount > 0) || (p.discount_percentage && p.discount_percentage > 0))
        .map((p: any) => {
          let discountPct = p.discount_percentage || (p.discount ? p.discount * 100 : 0);
          return {
            ...p,
            id: p._id || p.id,
            discount_percentage: Math.round(discountPct),
            discount: p.discount || (p.discount_percentage ? p.discount_percentage / 100 : 0)
          };
        })
        .slice(0, 10);
      if (sortBy === "discount") {
        productsWithDiscount.sort((a: any, b: any) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
      } else {
        productsWithDiscount.sort((a, b) => a.price - b.price);
      }
      setProducts(productsWithDiscount);
    } catch (error) {
      console.error(" Erro ao carregar ofertas:", error);
      toast.error("Erro ao carregar ofertas");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 200);
  };

  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      await cartService.addToCart(productId, quantity);
      toast.success(` ${quantity}x produto adicionado ao carrinho!`);
    } catch (error: any) {
      console.error(" Erro ao adicionar:", error);
      toast.error(error.message || "Erro ao adicionar ao carrinho");
    }
  };

  const PromotionCard = ({ promotion }: { promotion: Promotion }) => {
    const Icon = promotionTypeIcons[promotion.type];
    const gradientColor = promotionTypeColors[promotion.type];
    const typeLabel = promotionTypeLabels[promotion.type];
    const endDate = new Date(promotion.end_date);
    const today = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    const getPromotionTitle = () => {
      switch (promotion.type) {
        case "percentage_discount": return `${promotion.discount_percentage}% OFF`;
        case "buy_x_pay_y": return `Leve ${promotion.buy_quantity} Pague ${promotion.pay_quantity}`;
        case "free_shipping": return "Frete Grátis";
        case "coupon_code": return promotion.coupon_code || "Cupom de Desconto";
        case "progressive_discount": return "Desconto Progressivo";
        default: return promotion.name;
      }
    };

    const getPromotionSubtitle = () => {
      switch (promotion.type) {
        case "percentage_discount":
          return promotion.min_order_value ? `Em compras acima de R$ ${promotion.min_order_value.toFixed(2)}` : "Em todos os produtos";
        case "buy_x_pay_y": return "Nos produtos selecionados";
        case "free_shipping": return `Em compras acima de R$ ${promotion.min_purchase_amount?.toFixed(2) || '0.00'}`;
        case "coupon_code":
          return promotion.coupon_discount_type === "percentage" 
            ? `${promotion.coupon_discount_value}% de desconto`
            : `R$ ${promotion.coupon_discount_value?.toFixed(2)} de desconto`;
        case "progressive_discount": return `${promotion.progressive_tiers?.length || 0} níveis de desconto`;
        default: return promotion.description;
      }
    };

    return (
      <div className={`relative bg-gradient-to-br ${gradientColor} rounded-xl shadow-2xl p-6 text-white overflow-hidden transform hover:scale-105 transition-all duration-300`}>
        <div className="absolute top-0 right-0 opacity-10"><Icon className="w-32 h-32" /></div>
        {daysLeft > 0 && daysLeft <= 7 && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full font-bold text-sm shadow-lg animate-pulse">
            {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
          </div>
        )}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm"><Icon className="w-8 h-8" /></div>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">{typeLabel.toUpperCase()}</span>
          </div>
          <h3 className="text-3xl font-bold mb-2">{promotion.name}</h3>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
            <p className="text-4xl font-black text-center mb-1">{getPromotionTitle()}</p>
            <p className="text-sm text-center opacity-90">{getPromotionSubtitle()}</p>
          </div>
          <p className="text-white/90 mb-4 line-clamp-2">{promotion.description}</p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="w-4 h-4" />
              <span>Válido até {new Date(promotion.end_date).toLocaleDateString('pt-BR')}</span>
            </div>
            {promotion.type === "coupon_code" && promotion.max_uses && (
              <div className="flex items-center gap-2 text-sm">
                <TicketIcon className="w-4 h-4" />
                <span>{promotion.max_uses - (promotion.current_uses || 0)} cupons restantes</span>
              </div>
            )}
            {promotion.type === "progressive_discount" && promotion.progressive_tiers && (
              <div className="text-sm space-y-1">
                {promotion.progressive_tiers.slice(0, 3).map((tier, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" />
                    <span>R$ {tier.min_amount.toFixed(2)} → {tier.discount_percentage}% OFF</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => router.push("/dashboard/products")} className="w-full bg-white text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg">
            <ShoppingCartIcon className="w-5 h-5" />Ver Produtos
          </button>
          {promotion.type === "coupon_code" && promotion.coupon_code && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-xs text-white/70 mb-1">Use o código:</p>
              <div className="bg-white/20 backdrop-blur-sm rounded px-3 py-2 text-center">
                <span className="font-mono font-bold text-lg">{promotion.coupon_code}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const discount = product.discount_percentage || Math.round((product.discount || 0) * 100);
    const discountDecimal = product.discount || (product.discount_percentage / 100);
    const originalPrice = discountDecimal > 0 ? product.price / (1 - discountDecimal) : product.price;
    const savedAmount = originalPrice - product.price;

    return (
      <div onClick={() => handleProductClick(product)} className="bg-white rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all overflow-hidden cursor-pointer relative">
        {discount > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">-{discount}%</div>
          </div>
        )}
        {discount >= 30 && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-yellow-500 text-black px-2 py-1 rounded-full font-bold text-xs flex items-center gap-1 shadow-lg">
              <FireIcon className="w-4 h-4" />HOT
            </div>
          </div>
        )}
        <div className="aspect-square bg-gray-200 relative">
          {product.image_urls?.[0] ? (
            <img src={getImageUrl(product.image_urls[0]) || ""} alt={product.name} className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=400&background=1f2937&color=facc15&bold=true`;
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400"><CubeIcon className="w-16 h-16" /></div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Sem Estoque</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-1">{product.category}</p>
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-400 line-through">De R$ {originalPrice.toFixed(2)}</p>
              <span className="text-xs text-green-600 font-semibold">Economize R$ {savedAmount.toFixed(2)}</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">Por R$ {product.price.toFixed(2)}</p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {product.stock > 0 ? (
                <span className="text-green-600 font-semibold">{product.stock} em estoque</span>
              ) : (
                <span className="text-red-600 font-semibold">Sem estoque</span>
              )}
            </p>
            {discount >= 20 && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-bold">SUPER OFERTA</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mb-4"></div>
        <p className="text-white font-semibold">Carregando ofertas...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${OFERTAS_BACKGROUND})` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavbarDashboard user={user} />
        <div className="flex-1">
          <main className="py-8 px-4 md:px-8 lg:px-24 xl:px-32 max-w-screen-2xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
                  <TagIcon className="w-8 h-8" />Ofertas Especiais
                </h1>
                <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm animate-pulse">
                  {products.length + promotions.length} Ofertas
                </span>
              </div>
              {products.length > 0 && (
                <div className="flex items-center gap-3">
                  <FunnelIcon className="w-5 h-5 text-white" />
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "discount" | "price")} className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <option value="discount">Maior Desconto</option>
                    <option value="price">Menor Preço</option>
                  </select>
                </div>
              )}
            </div>
            <div className="mb-8"><ComingSoon /></div>
            {promotions.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <GiftIcon className="w-8 h-8 text-pink-400" />
                  <h2 className="text-2xl font-bold text-white">Promoções Especiais</h2>
                  <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">{promotions.length} ativas</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promotions.map((promotion) => (<PromotionCard key={promotion._id} promotion={promotion} />))}
                </div>
              </section>
            )}
            <section className="mb-8">
              {products.length === 0 && promotions.length === 0 ? (
                <div className="bg-white/90 rounded-lg p-12 text-center">
                  <TagIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma oferta disponível no momento</h2>
                  <p className="text-gray-600 mb-4">Não encontramos produtos com desconto ou promoções ativas.</p>
                  <button onClick={() => router.push("/dashboard")} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Voltar ao Dashboard</button>
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <FireIcon className="w-8 h-8 text-orange-400" />
                    <h2 className="text-2xl font-bold text-white">Produtos em Promoção</h2>
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">{products.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (<ProductCard key={product.id} product={product} />))}
                  </div>
                </>
              ) : null}
            </section>
          </main>
        </div>
        <Footer />
      </div>
      {selectedProduct && (
        <ProductModal product={selectedProduct} isOpen={isModalOpen} onClose={closeProductModal} getImageUrl={getImageUrl} onAddToCart={handleAddToCart} />
      )}
    </div>
  );
}