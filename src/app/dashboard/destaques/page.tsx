"use client";

import { useState, useEffect } from "react";
import { authService } from "@/app/services/auth";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  SparklesIcon,
  FireIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import NavbarDashboard from "@/app/components/dashboard/NavbarDashboard";
import Footer from "@/app/components/layout/Footer";
import ComingSoon from "@/app/components/dashboard/ComingSoon";
import { useBackground } from "@/app/hooks/useBackground";
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
  brand?: string;
  image_urls: string[];
  created_at: string;
  sold_count?: number; // ✅ CAMPO PARA PRODUTOS MAIS VENDIDOS
}

export default function DestaquesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mostExpensiveProducts, setMostExpensiveProducts] = useState<Product[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { backgroundUrl, loading: bgLoading } = useBackground("dashboard");

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
        loadProducts();
      }
    }
  }, [router]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      let allProducts: Product[] = [];
      let currentPage = 1;
      let totalPages = 1;

      // ✅ BUSCAR TODOS OS PRODUTOS
      do {
        const res = await fetch(`${baseURL}/products/?page=${currentPage}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erro ao carregar produtos");

        const data = await res.json();

        if (data.products && Array.isArray(data.products)) {
          allProducts = [...allProducts, ...data.products];
          totalPages = data.pages || 1;
        } else if (Array.isArray(data)) {
          allProducts = [...allProducts, ...data];
          break;
        }

        currentPage++;
      } while (currentPage <= totalPages);

      console.log(`✅ ${allProducts.length} produtos carregados`);

      // ✅ PRODUTOS MAIS CAROS (top 8)
      const expensiveProducts = [...allProducts]
        .filter(p => p.stock > 0) // Apenas com estoque
        .sort((a, b) => {
          const priceA = a.discount_percentage 
            ? a.price * (1 - a.discount_percentage / 100) 
            : a.price;
          const priceB = b.discount_percentage 
            ? b.price * (1 - b.discount_percentage / 100) 
            : b.price;
          return priceB - priceA;
        })
        .slice(0, 8);

      console.log(`💰 ${expensiveProducts.length} produtos mais caros encontrados`);
      setMostExpensiveProducts(expensiveProducts);

      // ✅ PRODUTOS MAIS VENDIDOS (simulado - últimos 8 produtos criados)
      // NOTA: Se sua API tiver um campo "sold_count", use ele aqui
      const bestSelling = [...allProducts]
        .filter(p => p.stock > 0)
        .sort((a, b) => {
          // Se tiver campo sold_count, use: b.sold_count - a.sold_count
          // Por enquanto, ordenando por data de criação (mais recentes)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
        .slice(0, 8);

      console.log(`🔥 ${bestSelling.length} produtos em destaque encontrados`);
      setBestSellingProducts(bestSelling);

    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos em destaque");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl: string): string | null => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    if (!imageUrl) return null;

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
      return `${baseURL}${imageUrl}`;
    }

    return `${baseURL}/${imageUrl}`;
  };

  const getFinalPrice = (product: Product) => {
    const discountValue = product.discount_percentage || product.discount || 0;
    if (discountValue > 0) {
      return product.price * (1 - discountValue / 100);
    }
    return product.price;
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 200);
  };

  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      await cartService.addItem(productId, quantity);
      toast.success(`${quantity}x produto adicionado ao carrinho!`);
    } catch (error: any) {
      toast.error(error.detail || "Erro ao adicionar ao carrinho");
    }
  };

  const ProductCard = ({ product, badge }: { product: Product; badge?: string }) => {
    const discountValue = product.discount_percentage || product.discount || 0;
    const finalPrice = getFinalPrice(product);

    return (
      <div
        onClick={() => openProductModal(product)}
        className="group bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2"
      >
        {/* Imagem */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.image_urls?.[0] ? (
            <img
              src={getImageUrl(product.image_urls[0]) || ""}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  product.name
                )}&size=400&background=f59e0b&color=1f2937&bold=true`;
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <TagIcon className="w-16 h-16" />
            </div>
          )}

          {/* Badge de Destaque */}
          {badge && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg animate-pulse">
              {badge}
            </div>
          )}

          {/* Badge de Desconto */}
          {discountValue > 0 && (
            <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg">
              -{discountValue.toFixed(0)}%
            </div>
          )}

          {/* Sem Estoque */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg bg-red-600 px-4 py-2 rounded-full">
                Sem Estoque
              </span>
            </div>
          )}

          {/* Overlay no Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Info do Produto */}
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-1 font-semibold">{product.category}</p>
          <h3 className="font-bold text-base mb-2 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Preços */}
          <div className="space-y-1 mb-3">
            {discountValue > 0 ? (
              <>
                <p className="text-sm text-gray-400 line-through">
                  R$ {product.price.toFixed(2)}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {finalPrice.toFixed(2)}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-blue-600">
                R$ {product.price.toFixed(2)}
              </p>
            )}
          </div>

          {/* Estoque */}
          <div className="flex items-center justify-between text-xs">
            {product.stock > 0 ? (
              <span className="text-green-600 font-semibold">
                ✓ {product.stock} em estoque
              </span>
            ) : (
              <span className="text-red-600 font-semibold">✗ Sem estoque</span>
            )}
            
            <ShoppingCartIcon className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    );
  };

  if (loading || bgLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mb-4"></div>
        <p className="text-white font-semibold">Carregando produtos em destaque...</p>
        <p className="text-gray-400 text-sm mt-2">
          Buscando os melhores produtos para você
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen flex flex-col bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <div className="absolute inset-0 bg-black/50 pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavbarDashboard user={user} />

        <div className="flex-1 overflow-y-auto">
          <main className="py-8 px-4 md:px-8 lg:px-24 xl:px-32 max-w-screen-2xl mx-auto">
            {/* Cabeçalho */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-3 flex items-center justify-center gap-3">
                <SparklesIcon className="w-10 h-10 animate-pulse" />
                Produtos em Destaque
                <SparklesIcon className="w-10 h-10 animate-pulse" />
              </h1>
              <p className="text-lg text-white/90">
                Os melhores produtos selecionados para você
              </p>
            </div>

            {/* ComingSoon */}
            <div className="mb-12">
              <ComingSoon />
            </div>

            {/* ✅ PRODUTOS MAIS CAROS */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-yellow-400/30">
                <div className="flex items-center gap-3 mb-2">
                  <CurrencyDollarIcon className="w-8 h-8 text-yellow-400" />
                  <h2 className="text-3xl font-bold text-yellow-400">Produtos Premium</h2>
                </div>
                <p className="text-white/80">
                  Os produtos mais exclusivos da nossa coleção ({mostExpensiveProducts.length} produtos)
                </p>
              </div>

              {mostExpensiveProducts.length === 0 ? (
                <div className="bg-white/90 rounded-lg p-8 text-center">
                  <p className="text-gray-600">Nenhum produto premium disponível</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {mostExpensiveProducts.map((product) => (
                    <ProductCard key={product.id} product={product} badge="💎 PREMIUM" />
                  ))}
                </div>
              )}
            </section>

            {/* ✅ PRODUTOS MAIS VENDIDOS */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <FireIcon className="w-8 h-8 text-red-500" />
                  <h2 className="text-3xl font-bold text-red-500">Mais Populares</h2>
                </div>
                <p className="text-white/80">
                  Os produtos favoritos dos nossos clientes ({bestSellingProducts.length} produtos)
                </p>
              </div>

              {bestSellingProducts.length === 0 ? (
                <div className="bg-white/90 rounded-lg p-8 text-center">
                  <p className="text-gray-600">Nenhum produto popular disponível</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {bestSellingProducts.map((product) => (
                    <ProductCard key={product.id} product={product} badge="🔥 POPULAR" />
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>

        <Footer />
      </div>

      {/* Modal do Produto */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={closeProductModal}
          getImageUrl={getImageUrl}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}