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

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount?: number; 
  stock: number;
  category: string;
  brand: string;
  image_urls: string[];
  created_at: string;
}

export default function OfertasPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"discount" | "price">("discount");

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
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [sortBy, user]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      console.log("🔍 Buscando produtos...");

      const data = await productsService.getProducts({
        skip: 0,
        limit: 1000,
      });

      console.log("📦 Total de produtos:", data.products.length);
      console.log("📊 Estrutura do primeiro produto:", data.products[0]);

      // ⚠️ FILTRO CORRIGIDO: usar 'discount' ao invés de 'discount_percentage'
      const productsWithDiscount = data.products
        .filter((p: Product) => !!p.discount && p.discount > 0)
        .map((p: Product) => ({
          ...p,
          // Converter discount (0.5 = 50%) para porcentagem
          discount_percentage: Math.round(p.discount * 100),
        }));

      console.log("🏷️ Produtos em oferta:", productsWithDiscount.length);

      if (productsWithDiscount.length > 0) {
        console.log("📊 Primeiros 3 produtos:", productsWithDiscount.slice(0, 3).map(p => ({
          name: p.name,
          price: p.price,
          discount: p.discount,
          discount_percentage: p.discount_percentage
        })));
      }

      // Ordenar
      if (sortBy === "discount") {
        productsWithDiscount.sort((a: any, b: any) => b.discount - a.discount);
      } else {
        productsWithDiscount.sort((a, b) => a.price - b.price);
      }

      setProducts(productsWithDiscount);
    } catch (error) {
      toast.error("Erro ao carregar ofertas");
      console.error("❌ Erro completo:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const ProductCard = ({ product }: { product: any }) => {
    const discount = product.discount_percentage || Math.round(product.discount * 100);
    const originalPrice = product.price / (1 - product.discount);
    const savedAmount = originalPrice - product.price;

    return (
      <div
        onClick={() => handleProductClick(product.id)}
        className="bg-white rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all overflow-hidden cursor-pointer relative"
      >
        {discount > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
              -{discount}%
            </div>
          </div>
        )}

        {discount >= 30 && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-yellow-500 text-black px-2 py-1 rounded-full font-bold text-xs flex items-center gap-1 shadow-lg">
              <FireIcon className="w-4 h-4" />
              HOT
            </div>
          </div>
        )}

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
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-400 line-through">
                De R$ {originalPrice.toFixed(2)}
              </p>
              <span className="text-xs text-green-600 font-semibold">
                Economize R$ {savedAmount.toFixed(2)}
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              Por R$ {product.price.toFixed(2)}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {product.stock > 0 ? (
                <span className="text-green-600 font-semibold">
                  {product.stock} em estoque
                </span>
              ) : (
                <span className="text-red-600 font-semibold">Sem estoque</span>
              )}
            </p>
            {discount >= 20 && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-bold">
                SUPER OFERTA
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading || bgLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mb-4"></div>
        <p className="text-white font-semibold">Carregando ofertas...</p>
        <p className="text-gray-400 text-sm mt-2">
          Buscando as melhores promoções para você
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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
                  <TagIcon className="w-8 h-8" />
                  Ofertas Especiais
                </h1>
                <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm animate-pulse">
                  {products.length} Ofertas
                </span>
              </div>

              {products.length > 0 && (
                <div className="flex items-center gap-3">
                  <FunnelIcon className="w-5 h-5 text-white" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "discount" | "price")}
                    className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="discount">Maior Desconto</option>
                    <option value="price">Menor Preço</option>
                  </select>
                </div>
              )}
            </div>

            <div className="mb-8">
              <ComingSoon />
            </div>

            <section className="mb-8">
              {products.length === 0 ? (
                <div className="bg-white/90 rounded-lg p-12 text-center">
                  <TagIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Nenhuma oferta disponível no momento
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Não encontramos produtos com desconto no momento.
                  </p>
                  <p className="text-sm text-gray-500">
                    Os produtos precisam ter o campo "discount" maior que 0 (Ex: 0.5 = 50% de desconto).
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/90 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Maior Desconto</p>
                      <p className="text-2xl font-bold text-red-600">
                        {Math.max(...products.map((p: any) => Math.round(p.discount * 100)))}%
                      </p>
                    </div>
                    <div className="bg-white/90 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Menor Preço</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {Math.min(...products.map(p => p.price)).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white/90 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Economia Total Possível</p>
                      <p className="text-2xl font-bold text-blue-600">
                        R$ {products.reduce((sum, p) => {
                          const original = p.price / (1 - p.discount);
                          return sum + (original - p.price);
                        }, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              )}
            </section>
          </main>
        </div>

        <Footer />
      </div>
    </div>
  );
}