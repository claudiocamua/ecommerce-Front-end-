"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/services/auth";
import Footer from "../components/layout/Footer";
import { toast } from "react-hot-toast";
import NavbarDashboard from "../components/dashboard/NavbarDashboard";
import UserInfo from "../components/dashboard/UserInfo";
import ComingSoon from "../components/dashboard/ComingSoon";
import CardAnime from "../components/dashboard/cardAnime";
import { SparklesIcon } from "@heroicons/react/24/outline";

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
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push("/");
          return;
        }

        const userData = authService.getUser();

        if (userData) {
          setUser(userData);
          setLoading(false);
        } else {
          const userDataFromAPI = await authService.getProfile();
          authService.saveUser(userDataFromAPI);
          setUser(userDataFromAPI);
          setLoading(false);
        }
      } catch (err) {
        toast.error("Sessão expirada");
        authService.logout();
        router.push("/");
      }
    };

    loadUserData();
  }, [router]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const token = authService.getToken();
        const baseURL =
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:8000";

        const res = await fetch(
          `${baseURL}/products/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok)
          throw new Error("Erro ao buscar produtos");

        const data = await res.json();

        const products =
          data.products || data || [];

        const mapped = products.map(
          (p: any) => ({
            ...p,
            id: p._id || p.id,
          })
        );

        setAllProducts(mapped);

        const uniqueCategories = [
          ...new Set(
            mapped.map((p: Product) => p.category)
          ),
        ];

        setCategories(uniqueCategories);
      } catch (error) {
        toast.error("Erro ao carregar produtos");
      } finally {
        setLoadingProducts(false);
      }
    };

    if (user) loadProducts();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-yellow-400 mb-4"></div>
        <p className="text-white font-semibold">
          Carregando...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        {error}
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* BACKGROUND */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/image-fundo-2.jpg')",
        }}
      />
      <div className="fixed inset-0 -z-10 bg-black/60" />

      <NavbarDashboard user={user} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 flex items-center justify-center gap-2">
            <SparklesIcon className="w-8 h-8 animate-pulse" />
            Categorias em Destaque
            <SparklesIcon className="w-8 h-8 animate-pulse" />
          </h1>
        </div>

        <ComingSoon />

        {/* LISTAGEM */}
        {loadingProducts ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {categories.slice(0, 4).map(
              (category, index) => (
                <CardAnime
                  key={category}
                  products={allProducts}
                  category={category}
                  maxProducts={2}
                  animationDelay={
                    0.1 + index * 0.1
                  }
                  animationType={5}
                />
              )
            )}
          </div>
        )}
      </main>

      {/* USER INFO */}
      <section className="bg-black/60 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <UserInfo user={user} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
