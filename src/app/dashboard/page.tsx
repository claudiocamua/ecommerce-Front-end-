"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/services/auth";
import { productsService } from "@/app/services/products";
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
  stock: number;
  category: string;
  brand: string;
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
          toast.loading("Carregando dados do usuário...", { id: "loading-user" });

          const userDataFromAPI = await authService.getProfile();
          authService.saveUser(userDataFromAPI);
          setUser(userDataFromAPI);

          toast.success("Dados carregados!", { id: "loading-user" });
          setLoading(false);
        }
      } catch (err: any) {
        console.error("❌ Erro ao carregar usuário:", err);
        setError("Erro ao carregar dados do usuário");
        toast.error("Erro ao carregar dados. Faça login novamente.");

        authService.logout();
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    };

    loadUserData();
  }, [router]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productsService.getProducts({
          skip: 0,
          limit: 100,
        });

        setAllProducts(data.products);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (user) {
      loadProducts();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mb-4"></div>
        <p className="text-white font-semibold">Carregando...</p>
        <p className="text-white/60 text-sm mt-2">
          Isso pode levar alguns segundos na primeira vez
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Ops! Algo deu errado
        </h2>
        <p className="text-white/60 mb-4">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 font-semibold"
        >
          Voltar para a home
        </button>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ✅ BACKGROUND IMAGE FIXO */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image-fundo-2.jpg')" }}
      />
      {/* Overlay escuro */}
      <div className="fixed inset-0 -z-10 bg-black/50" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavbarDashboard user={user} />

        <div className="flex-1 overflow-y-auto">
          <main className="container-custom py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-3 flex items-center justify-center gap-3">
                <SparklesIcon className="w-10 h-10" />
                Categorias em Destaque
                <SparklesIcon className="w-10 h-10" />
              </h1>
            </div>

            <div className="mb-12">
              <ComingSoon />
            </div>

            {loadingProducts ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              </div>
            ) : (
              <>
                {/* Layout Desktop: 3 cards de cada lado */}
                <div className="hidden lg:block">
                  <div className="relative min-h-[1400px] w-full">
                    {/* Cards da Esquerda */}
                    <div className="absolute left-4 xl:left-10 top-0 w-72 xl:w-80 flex flex-col gap-10">
                      <CardAnime
                        products={allProducts}
                        category="Blusas Femininas"
                        maxProducts={4}
                        animationDelay={0.2}
                        animationType={5}
                      />
                      <CardAnime
                        products={allProducts}
                        category="Calças Femininas"
                        maxProducts={4}
                        animationDelay={0.4}
                        animationType={5}
                      />
                      <CardAnime
                        products={allProducts}
                        category="Bijuterias"
                        maxProducts={4}
                        animationDelay={0.6}
                        animationType={5}
                      />
                    </div>

                    {/* Cards da Direita */}
                    <div className="absolute right-4 xl:right-10 top-0 w-72 xl:w-80 flex flex-col gap-10">
                      <CardAnime
                        products={allProducts}
                        category="Relógios"
                        maxProducts={4}
                        animationDelay={0.2}
                        animationType={5}
                      />
                      <CardAnime
                        products={allProducts}
                        category="Camisas Masculinas"
                        maxProducts={4}
                        animationDelay={0.4}
                        animationType={5}
                      />
                      <CardAnime
                        products={allProducts}
                        category="Calças Masculinas"
                        maxProducts={4}
                        animationDelay={0.6}
                        animationType={5}
                      />
                    </div>
                  </div>
                </div>

                {/* Layout Tablet: 2 colunas com 3 cards cada */}
                <div className="hidden md:block lg:hidden">
                  <div className="grid grid-cols-2 gap-8 mx-auto px-4">
                    <div className="flex flex-col gap-12">
                      <CardAnime
                        products={allProducts}
                        category="Blusas Femininas"
                        maxProducts={4}
                        animationDelay={0.1}
                        animationType={5}
                      />
                      <CardAnime
                        products={allProducts}
                        category="Calças Femininas"
                        maxProducts={4}
                        animationDelay={0.3}
                        animationType={5}
                      />
                      <CardAnime
                        products={allProducts}
                        category="Bijuterias"
                        maxProducts={4}
                        animationDelay={0.5}
                        animationType={5}
                      />
                    </div>
                    <div className="flex flex-col gap-12">
                      <CardAnime
                        products={allProducts}
                        category="Relógios"
                        maxProducts={4}
                        animationDelay={0.2}
                        animationType={5}
                      />
                      <CardAnime
                        products={allProducts}
                        category="Camisas Masculinas"
                        maxProducts={4}
                        animationDelay={0.4}
                        animationType={5}
                      />
                      <CardAnime
                        products={allProducts}
                        category="Calças Masculinas"
                        maxProducts={4}
                        animationDelay={0.6}
                        animationType={5}
                      />
                    </div>
                  </div>
                </div>

                {/* Layout Mobile: 2 colunas centralizada */}
                <div className="block md:hidden">
                  <div className="grid grid-cols-2 items-center gap-10 px-6 max-w-sm mx-auto">
                    <CardAnime
                      products={allProducts}
                      category="Blusas Femininas"
                      maxProducts={4}
                      animationDelay={0.1}
                      animationType={5}
                    />
                    <CardAnime
                      products={allProducts}
                      category="Calças Femininas"
                      maxProducts={4}
                      animationDelay={0.2}
                      animationType={5}
                    />
                    <CardAnime
                      products={allProducts}
                      category="Bijuterias"
                      maxProducts={4}
                      animationDelay={0.3}
                      animationType={5}
                    />
                    <CardAnime
                      products={allProducts}
                      category="Relógios"
                      maxProducts={4}
                      animationDelay={0.4}
                      animationType={5}
                    />
                    <CardAnime
                      products={allProducts}
                      category="Camisas Masculinas"
                      maxProducts={4}
                      animationDelay={0.5}
                      animationType={5}
                    />
                    <CardAnime
                      products={allProducts}
                      category="Calças Masculinas"
                      maxProducts={4}
                      animationDelay={0.6}
                      animationType={5}
                    />
                  </div>
                </div>

                {/* Espaçamento para o footer */}
                <div className="h-24"></div>
              </>
            )}
          </main>
        </div>

        <section className="w-full bg-black/50 border-t border-white/20 py-8">
          <div className="container-custom">
            <UserInfo user={user} />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}