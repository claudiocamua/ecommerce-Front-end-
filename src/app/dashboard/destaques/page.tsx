"use client";

import { useState, useEffect } from "react";
import { productsService } from "@/app/services/products";
import { authService } from "@/app/services/auth";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  SparklesIcon,
  ClockIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import NavbarDashboard from "@/app/components/dashboard/NavbarDashboard";
import Footer from "@/app/components/layout/Footer";
import ComingSoon from "@/app/components/dashboard/ComingSoon";
import { useBackground } from "@/app/hooks/useBackground";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  stock: number;
  category: string;
  brand: string;
  image_urls: string[];
  created_at: string;
}

export default function DestaquesPage() {
  const router = useRouter();
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getUser();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error("Faça login para acessar esta página");
      router.push("/login");
      return;
    }
    loadProducts();
  }, []);

  const { backgroundUrl, loading: bgLoading } = useBackground("dashboard");

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Buscar produtos recentes (últimos 8)
      const recentData = await productsService.getProducts({
        page: 1,
        page_size: 8,
        sort_by: "created_at",
        sort_order: "desc",
      });
      setNewProducts(recentData.products);

      console.log("🔍 Novos produtos encontrados:", recentData.products.length);
    } catch (error) {
      toast.error("Erro ao carregar produtos em destaque");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const calculateDiscount = (product: Product) => {
    if (product.original_price && product.price < product.original_price) {
      return Math.round(((product.original_price - product.price) / product.original_price) * 100);
    }
    return product.discount_percentage || 0;
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const discount = calculateDiscount(product);

    return (
      <div
        onClick={() => handleProductClick(product.id)}
        className="bg-white rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all overflow-hidden cursor-pointer"
      >
        <div className="aspect-square bg-gray-200 relative">
          {product.image_urls?.[0] ? (
            <img
              src={
                product.image_urls[0].startsWith("http")
                  ? product.image_urls[0]
                  : `http://localhost:8000${product.image_urls[0]}`
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <CubeIcon className="w-16 h-16" />
            </div>
          )}

          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
              -{discount}%
            </div>
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
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="space-y-1">
            {product.original_price && product.original_price > product.price && (
              <p className="text-sm text-gray-400 line-through">
                R$ {product.original_price.toFixed(2)}
              </p>
            )}
            <p className="text-2xl font-bold text-blue-600">
              R$ {product.price.toFixed(2)}
            </p>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            {product.stock > 0 ? (
              <span className="text-green-600">{product.stock} em estoque</span>
            ) : (
              <span className="text-red-600">Sem estoque</span>
            )}
          </p>
        </div>
      </div>
    );
  };

  if (loading || bgLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mb-4"></div>
        <p className="text-white font-semibold">Carregando produtos em destaque...</p>
        <p className="text-gray-400 text-sm mt-2">
          Buscando os produtos mais recentes
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
            {/* Cabeçalho */}
            <div className="flex items-center gap-4 mb-8">
              <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
                <SparklesIcon className="w-8 h-8" />
                Produtos em Destaque
              </h1>
            </div>

            {/* Botões Animados Laterais */}
            <div className="mb-8">
              <ComingSoon />
            </div>

            {/* Produtos Novos */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <ClockIcon className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Novidades</h2>
                <span className="text-sm text-gray-300">
                  ({newProducts.length} produtos)
                </span>
              </div>

              {newProducts.length === 0 ? (
                <div className="bg-white/90 rounded-lg p-8 text-center">
                  <p className="text-gray-600">Nenhum produto novo encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {newProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>

        <Footer />
      </div>
    </div>
  );
}