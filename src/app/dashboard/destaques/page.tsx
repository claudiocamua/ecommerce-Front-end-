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
  sold_count?: number;
}

export default function DestaquesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mostExpensiveProducts, setMostExpensiveProducts] = useState<Product[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error("Faça login para continuar");
      router.push("/login");
      return;
    }

    const userData = authService.getUser();
    setUser(userData);

    if (userData) loadProducts();
  }, [router]);
  
  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${baseURL}/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      const allProducts = data.products || data || [];

      const premium = [...allProducts]
        .filter((p: Product) => p.stock > 0)
        .sort((a: Product, b: Product) => {
          const aPrice = a.discount_percentage
            ? a.price * (1 - a.discount_percentage / 100)
            : a.price;
          const bPrice = b.discount_percentage
            ? b.price * (1 - b.discount_percentage / 100)
            : b.price;
          return bPrice - aPrice;
        })
        .slice(0, 8);

      const popular = [...allProducts]
        .filter((p: Product) => p.stock > 0)
        .sort((a: Product, b: Product) =>
          (b.sold_count || 0) - (a.sold_count || 0)
        )
        .slice(0, 8);

      setMostExpensiveProducts(premium);
      setBestSellingProducts(popular);
    } catch {
      toast.error("Erro ao carregar destaques");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${base}/${url.replace("/", "")}`;
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 200);
  };

  const handleAddToCart = async (id: string, qty: number) => {
    try {
      await cartService.addToCart(id, qty);
      toast.success("Produto adicionado!");
    } catch {
      toast.error("Erro ao adicionar");
    }
  };

  const ProductCard = ({ product, badge }: { product: Product; badge?: string }) => {
    const discount = product.discount_percentage || product.discount || 0;
    const finalPrice =
      discount > 0 ? product.price * (1 - discount / 100) : product.price;

    return (
      <div
        onClick={() => openModal(product)}
        className="group bg-white/95 rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
      >
        <div className="aspect-square bg-gray-100 relative">
          {product.image_urls?.[0] ? (
            <img
              src={getImageUrl(product.image_urls[0]) || ""}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <TagIcon className="w-12 h-12" />
            </div>
          )}

          {badge && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-bold">
              {badge}
            </span>
          )}

          {discount > 0 && (
            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              -{discount.toFixed(0)}%
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs text-gray-500">{product.category}</p>
          <h3 className="font-bold text-gray-800 line-clamp-2">
            {product.name}
          </h3>

          <div className="mt-2">
            {discount > 0 ? (
              <>
                <p className="text-xs line-through text-gray-400">
                  R$ {product.price.toFixed(2)}
                </p>
                <p className="text-lg font-bold text-green-600">
                  R$ {finalPrice.toFixed(2)}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-blue-600">
                R$ {product.price.toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center mt-3 text-xs">
            <span
              className={`font-semibold ${
                product.stock > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {product.stock > 0
                ? `${product.stock} em estoque`
                : "Sem estoque"}
            </span>

            <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
    );
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="animate-spin h-14 w-14 border-b-4 border-yellow-400 rounded-full" />
        <p className="text-white mt-4">
          Carregando destaques...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image-fundo-2.jpg')" }}
    >
      <div className="bg-black/60 min-h-screen">
        <NavbarDashboard user={user} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* HEADER */}
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 flex justify-center gap-2">
              <SparklesIcon className="w-8 h-8 animate-pulse" />
              Produtos em Destaque
            </h1>
            <p className="text-white/80 mt-2">
              Selecionados para você
            </p>
          </div>

          <ComingSoon />

          <section className="mt-10">
            <div className="flex items-center gap-2 mb-5">
              <CurrencyDollarIcon className="w-7 h-7 text-yellow-400" />
              <h2 className="text-2xl font-bold text-yellow-400">
                Premium
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mostExpensiveProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>

          <section className="mt-16">
            <div className="flex items-center gap-2 mb-5">
              <FireIcon className="w-7 h-7 text-red-500" />
              <h2 className="text-2xl font-bold text-red-500">
                Mais vendidos
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestSellingProducts.map((p) => (
                <ProductCard key={p.id} product={p} badge="!" />
              ))}
            </div>
          </section>
        </main>

        <Footer />

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            isOpen={isModalOpen}
            onClose={closeModal}
            getImageUrl={getImageUrl}
            onAddToCart={handleAddToCart}
          />
        )}
      </div>
    </div>
  );
}
